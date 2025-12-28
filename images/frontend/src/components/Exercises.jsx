import React, { useEffect, useState } from "react";
import "../App.css";
import exercisesData from "./gym_exercises.json";
import Filter from "./Filter";
import WorkoutTemplateBuilder from "./WorkoutTemplateBuilder";
import trackEvent from "../utils/trackEvent";
import { useNotifications, showWorkoutError } from "../utils/notifications";
import { API_CONFIG, api, handleAuthError } from "../utils/api.js";

export default function Exercises({ onStartWorkout, onViewProfile, onViewHistory, onEditTemplate }) {
	console.log('Exercises component mounting...');
	const { showError, showSuccess, showWarning } = useNotifications();
	const [exercises, setExercises] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		muscleGroup: "",
		equipment: "",
		difficulty: "",
	});
	
	const [templates, setTemplates] = useState([]);
	const [personalRecords, setPersonalRecords] = useState({});
	const [expandedInstructions, setExpandedInstructions] = useState(new Set());
	
	// Exercise selection and workout builder state
	const [selectedExercises, setSelectedExercises] = useState([]);
	const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
	const [workoutConfig, setWorkoutConfig] = useState({
		globalSets: 3,
		globalReps: "10", 
		globalWeight: 0,
		globalRest: 60
	});
	
	// Page view management state (simplified for debugging)
	const [currentView, setCurrentView] = useState('main');
	const [showWorkoutChoice, setShowWorkoutChoice] = useState(false);
	// const [showWorkoutChoice, setShowWorkoutChoice] = useState(false); // Temporarily disabled
	
	// Hover tracking state
	const [hoverTimers, setHoverTimers] = useState({});
	const [instructionViewTimers, setInstructionViewTimers] = useState({});

	// Quick-start workout presets
	const quickStartPresets = [
		{
			name: "Quick Full Body",
			exercises: ["Bench Press", "Squats", "Deadlift", "Pull-ups", "Shoulder Press", "Plank"],
			sets: 3,
			reps: "10",
			rest: 60,
			estimatedTime: 20
		},
		{
			name: "Upper Body Power",
			exercises: ["Bench Press", "Pull-ups", "Shoulder Press", "Bicep Curls", "Tricep Dips"],
			sets: 3,
			reps: "10",
			rest: 60,
			estimatedTime: 25
		},
		{
			name: "Lower Body Focus",
			exercises: ["Squats", "Deadlift", "Lunges", "Calf Raises"],
			sets: 4,
			reps: "8-12",
			rest: 90,
			estimatedTime: 20
		},
		{
			name: "Core Crusher",
			exercises: ["Plank", "Crunches", "Russian Twists", "Leg Raises"],
			sets: 3,
			reps: "15",
			rest: 45,
			estimatedTime: 15
		}
	];

	// Hover tracking functions
	const handleMouseEnter = (exerciseId) => {
		const startTime = Date.now();
		console.log(`Hover started on exercise: ${exerciseId}`);
		setHoverTimers(prev => ({ ...prev, [exerciseId]: startTime }));
	};

	const handleMouseLeave = (exerciseId) => {
		const startTime = hoverTimers[exerciseId];
		if (startTime) {
			const hoverDuration = Date.now() - startTime;
			console.log(`Hover ended on exercise: ${exerciseId}, duration: ${hoverDuration}ms`);
			trackEvent("exercise_hover", {
				exerciseId,
				duration: hoverDuration,
			}).catch(error => {
				console.error('Failed to track exercise hover:', error);
			});
			setHoverTimers(prev => {
				const newTimers = { ...prev };
				delete newTimers[exerciseId];
				return newTimers;
			});
		}
	};

	const handleExerciseClick = (exerciseId, exerciseName) => {
		console.log(`Exercise clicked: ${exerciseName} (${exerciseId})`);
		trackEvent("exercise_click", {
			exerciseId,
			exerciseName,
		}).catch(error => {
			console.error('Failed to track exercise click:', error);
		});
	};

	const handleInstructionsToggle = (exerciseId, isOpening) => {
		if (isOpening) {
			// Track when instructions are opened
			const startTime = Date.now();
			setInstructionViewTimers(prev => ({ ...prev, [exerciseId]: startTime }));
			trackEvent("exercise_instructions_opened", {
				exerciseId,
			});
		} else {
			// Track when instructions are closed and calculate view duration
			const startTime = instructionViewTimers[exerciseId];
			if (startTime) {
				const viewDuration = Date.now() - startTime;
				trackEvent("exercise_instructions_closed", {
					exerciseId,
					duration: viewDuration,
				});
				setInstructionViewTimers(prev => {
					const newTimers = { ...prev };
					delete newTimers[exerciseId];
					return newTimers;
				});
			}
		}
	};

	// Exercise selection functions
	const addExerciseToWorkout = (exercise) => {
		const isAlreadyAdded = selectedExercises.some(ex => ex.exerciseId === exercise.id);
		
		if (isAlreadyAdded) {
			showWarning('Exercise already added to your workout!');
			return;
		}

		const newExercise = {
			exerciseId: exercise.id,
			exerciseName: exercise.name,
			muscleGroup: exercise.muscleGroup,
			targetSets: workoutConfig.globalSets,
			targetReps: workoutConfig.globalReps,
			targetWeight: workoutConfig.globalWeight,
			restTime: workoutConfig.globalRest,
			equipment: exercise.equipment,
			difficulty: exercise.difficulty
		};

		setSelectedExercises([...selectedExercises, newExercise]);
		setShowWorkoutBuilder(true);
		showSuccess(`${exercise.name} added to workout!`);
	};

	const removeExerciseFromWorkout = (exerciseId) => {
		const newExercises = selectedExercises.filter(ex => ex.exerciseId !== exerciseId);
		setSelectedExercises(newExercises);
		
		if (newExercises.length === 0) {
			setShowWorkoutBuilder(false);
		}
	};

	const clearWorkout = () => {
		setSelectedExercises([]);
		setShowWorkoutBuilder(false);
	};

	const handleSaveWorkoutAsTemplate = async () => {
		if (selectedExercises.length === 0) {
			alert('Please add exercises to your workout before saving as a template.');
			return;
		}

		const templateName = prompt('Enter a name for your workout template:');
		if (!templateName || templateName.trim() === '') {
			return;
		}

		try {
			const token = localStorage.getItem('token');
			if (!token) {
				alert('Please log in to save templates.');
				return;
			}

			// Prepare template data with full exercise details
			const templateData = {
				name: templateName.trim(),
				description: `Custom workout with ${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''}`,
				category: 'Custom',
				tags: ['custom'],
				exercises: selectedExercises.map((ex, index) => ({
					exerciseId: ex.exerciseId.toString(),
					exerciseName: ex.exerciseName,
					muscleGroup: ex.muscleGroup,
					targetSets: ex.sets || ex.targetSets || workoutConfig.globalSets,
					targetReps: ex.reps || ex.targetReps || workoutConfig.globalReps,
					targetWeight: ex.weight || ex.targetWeight || workoutConfig.globalWeight,
					restTime: ex.rest || ex.restTime || workoutConfig.globalRest,
					exerciseRestTime: 90, // Default rest time between exercises
					order: index + 1
				}))
			};

			const response = await fetch('http://localhost:5000/api/workouts/template', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(templateData)
			});

			if (response.ok) {
				alert(`Template "${templateName}" saved successfully!`);
				// Refresh templates to show the new one
				await fetchTemplates();
				// Clear the workout builder
				clearWorkout();
			} else {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save template');
			}
		} catch (error) {
			console.error('Error saving template:', error);
			alert('Failed to save template: ' + error.message);
		}
	};

	const updateExerciseConfig = (exerciseId, field, value) => {
		const updatedExercises = selectedExercises.map(ex => 
			ex.exerciseId === exerciseId 
				? { ...ex, [field]: value }
				: ex
		);
		setSelectedExercises(updatedExercises);
	};

	// Exercise detail view functions
	const handleWorkoutChoice = () => {
		setShowWorkoutChoice(true);
	};

	const handleBackToMain = () => {
		setCurrentView('main');
		setShowWorkoutChoice(false);
	};

	

	const handleDeleteTemplate = async (templateId) => {
		try {
			const data = await api.delete(`/api/workouts/template/${templateId}`);
			
			// Remove template from local state
			setTemplates(templates.filter(t => t._id !== templateId));
			showSuccess('Template deleted successfully!');
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			showWorkoutError(error, 'delete template', showError);
		}
	};

	const handleStartTemplate = async (template) => {
		try {
			const data = await api.post(API_CONFIG.ENDPOINTS.WORKOUT_SESSION, {
				workoutTemplateId: template._id
			});
			
			trackEvent("template_workout_started", {
				templateName: template.name,
				templateCategory: template.category,
				exerciseCount: template.exercises.length
			});
			
			onStartWorkout(data);
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			showWorkoutError(error, 'start template workout', showError);
		}
	};

	const handleStartPremadeWorkout = (preset) => {
		const presetExercises = exercises
			.filter(ex => preset.exercises.includes(ex.name))
			.map(exercise => ({
				exerciseId: exercise.id,
				exerciseName: exercise.name,
				muscleGroup: exercise.muscleGroup,
				targetSets: preset.sets,
				targetReps: preset.reps,
				targetWeight: 0,
				restTime: preset.rest,
				equipment: exercise.equipment,
				difficulty: exercise.difficulty
			}));
		
		setSelectedExercises(presetExercises);
		setShowWorkoutBuilder(true);
		setShowWorkoutChoice(false);
		setCurrentView('main');
		showSuccess(`${preset.name} preset loaded! ${presetExercises.length} exercises added.`);
	};

	const handleStartCustomWorkoutFlow = () => {
		setShowWorkoutChoice(false);
		setCurrentView('main');
		// Focus on exercise selection
	};

	const handleStartCustomWorkout = async () => {
		try {
			if (selectedExercises.length === 0) {
				showWarning('Please add at least one exercise to your workout');
				return;
			}

			const workoutSession = await api.post('/api/workouts/session', {
				customName: 'Custom Workout',
				customCategory: 'Custom',
				exercises: selectedExercises
			});

			onStartWorkout(workoutSession);
			setSelectedExercises([]);
			setShowWorkoutBuilder(false);
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			showWorkoutError(error, 'start custom workout', showError);
		}
	};

	// Load exercises and user data
	useEffect(() => {
		console.log('Loading exercises data...');
		setExercises(exercisesData);
		console.log('Exercises loaded:', exercisesData.length);
		fetchTemplates();
		fetchPersonalRecords();
		setLoading(false);
	}, []);

	const fetchTemplates = async () => {
		try {
			const data = await api.get(API_CONFIG.ENDPOINTS.WORKOUT_TEMPLATES);
			setTemplates(data.templates || []);
		} catch (error) {
			// Handle authentication errors specifically
			if (handleAuthError(error)) {
				return; // Don't show additional error message, function will handle logout
			}
			showWorkoutError(error, 'fetch templates', showError);
		}
	};

	const fetchPersonalRecords = async () => {
		try {
			const data = await api.get(API_CONFIG.ENDPOINTS.PERSONAL_RECORDS);
			const recordsMap = {};
			
			data.records.forEach(record => {
				if (!recordsMap[record.exerciseId]) {
					recordsMap[record.exerciseId] = {
						exerciseId: record.exerciseId,
						exerciseName: record.exerciseName,
						muscleGroup: record.muscleGroup,
						weight: record.weight,
						reps: record.reps,
						volume: record.volume,
						duration: record.duration
					};
				}
			});
			
			setPersonalRecords(recordsMap);
		} catch (error) {
			if (handleAuthError(error)) {
				return;
			}
			showWorkoutError(error, 'fetch personal records', showError);
		}
	};

	// Check if exercise is in user's templates
	const isExerciseInTemplates = (exerciseId) => {
		return templates.some(template => 
			template.exercises.some(ex => ex.exerciseId === exerciseId)
		);
	};
	
	// Get completion count for exercise
	const getExerciseCompletionCount = (exerciseId) => {
		const record = personalRecords[exerciseId];
		if (!record) return 0;
		
		// This is a simplified count - in reality we'd need to count from sessions
		return record.weight ? 1 : 0;
	};

	// Filter exercises based on current filters
	const filteredExercises = exercises.filter(ex => {
		const matchMuscle = !filters.muscleGroup || ex.muscleGroup === filters.muscleGroup;
		const matchEquipment = !filters.equipment || ex.equipment === filters.equipment;
		const matchDifficulty = !filters.difficulty || ex.difficulty === filters.difficulty;

		return matchMuscle && matchEquipment && matchDifficulty;
	});

	// Show loading state
	if (loading) {
		return (
			<div className="exercise-container">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading exercises...</p>
				</div>
			</div>
		);
	}

	// Main view
	return (
		<div className="exercise-container">
			{/* Enhanced Navigation Header */}
			<div className="enhanced-navigation">
				<div className="nav-container">
					<div className="nav-title">
						<h1 className="main-title">💪 Gym Workout Platform</h1>
						<p className="nav-subtitle">Build Workouts • Track Progress • Reach Goals</p>
					</div>
					
					<div className="nav-buttons">
						{onStartWorkout && (
							<button 
								onClick={currentView === 'main' ? handleWorkoutChoice : handleBackToMain}
								className="nav-btn primary-btn"
							>
								<span className="btn-icon">{currentView === 'main' ? '🏋️' : '⬅️'}</span>
								<span className="btn-text">{currentView === 'main' ? 'Start Workout' : 'Back'}</span>
							</button>
						)}
						
						{onViewHistory && currentView === 'main' && (
							<button 
								onClick={onViewHistory}
								className="nav-btn secondary-btn"
							>
								<span className="btn-icon">📊</span>
								<span className="btn-text">Workout History</span>
							</button>
						)}
						
						{onViewProfile && currentView === 'main' && (
							<button 
								onClick={onViewProfile}
								className="nav-btn secondary-btn"
							>
								<span className="btn-icon">👤</span>
								<span className="btn-text">My Progress</span>
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Website Introduction */}
			<div className="website-introduction">
				<div className="intro-content">
					<div className="intro-header">
						<div className="intro-icon">💪</div>
						<h3>Welcome to Your Fitness Journey</h3>
						<p className="intro-tagline">Professional Workout Tracking & Template Management</p>
					</div>
					
					<div className="intro-mission">
						<h4>🎯 Our Mission</h4>
						<p>
							We're dedicated to helping you achieve your fitness goals through intelligent workout tracking, 
							personalized templates, and comprehensive exercise library. Whether you're a beginner 
							starting your fitness journey or an experienced athlete looking to optimize performance, 
							our platform provides the tools you need to succeed.
						</p>
					</div>
					
					<div className="intro-features">
						<div className="feature-card">
							<div className="feature-icon">🧠</div>
							<h5>Smart Workouts</h5>
							<p>AI-powered workout recommendations based on your goals and fitness level</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">📋</div>
							<h5>Custom Templates</h5>
							<p>Create and save personalized workout templates for quick access</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">📈</div>
							<h5>Progress Analytics</h5>
							<p>Track your performance with detailed analytics and insights</p>
						</div>
					</div>
					
					<div className="intro-call-to-action">
						<p>Ready to start your workout? Browse our exercise library or choose from premade workouts below!</p>
					</div>
				</div>
			</div>

			{/* Filter Section */}
			<Filter 
				filters={filters} 
				setFilters={setFilters} 
				exercises={exercises}
			/>

			{/* Templates Section */}
			<div className="templates-section">
				<div className="templates-header">
					<h2>My Workout Templates</h2>
				</div>
				
				{templates.length > 0 ? (
					<div className="templates-grid">
						{templates.map(template => (
							<div key={template._id} className="template-card">
								<div className="template-header">
									<h3>{template.name}</h3>
									<div className="template-actions">
										<button 
											onClick={() => handleStartTemplate(template)}
											className="btn btn-small btn-primary"
											title="Start workout with this template"
										>
											▶️
										</button>
										<button 
											onClick={() => {
												if (onEditTemplate) {
													onEditTemplate(template);
												} else {
													setEditingTemplate(template);
													setShowTemplateBuilder(true);
												}
											}}
											className="btn btn-small btn-secondary"
											title="Edit template"
										>
											✏️
										</button>
										<button 
											onClick={() => handleDeleteTemplate(template._id)}
											className="btn btn-small btn-danger"
											title="Delete template"
										>
											🗑️
										</button>
									</div>
								</div>
								<p className="template-description">{template.description}</p>
								<div className="template-meta">
									<span className="template-category">{template.category}</span>
									<span className="template-exercises-count">{template.exercises.length} exercises</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="no-templates">
						<p>No templates created yet. Start building your custom workouts!</p>
					</div>
				)}
			</div>

			{/* Exercise Grid */}
			<div className="exercise-grid enhanced">
				{filteredExercises.length > 0 ? (
					filteredExercises.map((ex) => {
						const isInTemplates = isExerciseInTemplates(ex.id);
						const completionCount = getExerciseCompletionCount(ex.id);
						const personalRecord = personalRecords[ex.id];
						const isSelected = selectedExercises.some(selEx => selEx.exerciseId === ex.id);
						
						return (
							<div
								key={ex.id}
								className={`exercise-card enhanced ${isInTemplates ? 'in-templates' : ''} ${isSelected ? 'selected' : ''}`}
								onMouseEnter={() => handleMouseEnter(ex.id)}
								onMouseLeave={() => handleMouseLeave(ex.id)}
								onClick={() => handleExerciseClick(ex.id, ex.name)}
							>
								{/* Exercise Header with Indicators */}
								<div className="exercise-card-header">
									<h3 className="exercise-name">{ex.name || "Unknown Name"}</h3>
									
									<div className="exercise-indicators">
										{isInTemplates && (
											<span className="indicator in-templates" title="In your templates">
												📋
											</span>
										)}
										
										{completionCount > 0 && (
											<span className="indicator completed" title={`Completed ${completionCount} times`}>
												✅ {completionCount}
											</span>
										)}
										
										{personalRecord?.weight && (
											<span className="indicator pr" title="Personal Record">
												🏆 {personalRecord.weight.displayValue}
											</span>
										)}
									</div>
								</div>

								{ex.video ? (
									<video className="exercise-video" controls preload="metadata">
										<source src={ex.video} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								) : (
									<div className="exercise-image placeholder">
										No video available
									</div>
								)}

								<div className="exercise-details">
									<p className="exercise-info">
										<strong>Muscle Group:</strong> {ex.muscleGroup}
									</p>
									<p className="exercise-info">
										<strong>Equipment:</strong> {ex.equipment}
									</p>
									<p className="exercise-info">
										<strong>Difficulty:</strong>{" "}
										<span className={`difficulty-${ex.difficulty.toLowerCase()}`}>
											{ex.difficulty}
										</span>
									</p>
								</div>

								{/* Exercise PR Summary */}
								{personalRecord && (
									<div className="exercise-pr-summary">
										<small>PR: {personalRecord.weight?.displayValue || personalRecord.reps?.displayValue || personalRecord.volume?.displayValue}</small>
									</div>
								)}

								{ex.instructions && ex.instructions.length > 0 && (
									<div className="exercise-instructions">
										<div 
											className="instructions-toggle"
											onClick={(e) => {
												e.stopPropagation();
												const newExpanded = new Set(expandedInstructions);
												const isCurrentlyExpanded = newExpanded.has(ex.id);
												const isExpanding = !isCurrentlyExpanded;
												
												if (isExpanding) {
													newExpanded.add(ex.id);
												} else {
													newExpanded.delete(ex.id);
												}
												setExpandedInstructions(newExpanded);
												
												handleInstructionsToggle(ex.id, isExpanding);
											}}
											title="Click to view exercise instructions and form"
										>
											<span>View Instructions {expandedInstructions.has(ex.id) ? '▼' : '▶'}</span>
										</div>
										{expandedInstructions.has(ex.id) && (
											<ol>
												{ex.instructions.map((instruction, idx) => (
													<li key={idx}>{instruction}</li>
												))}
											</ol>
										)}
									</div>
								)}

								{/* Exercise Actions */}
								<div className="exercise-actions">
									{isSelected ? (
										<button 
											className="btn btn-success btn-small"
											onClick={(e) => {
												e.stopPropagation();
											}}
											disabled
										>
											✓ Added
										</button>
									) : (
										<button 
											className="btn btn-primary btn-small"
											onClick={(e) => {
												e.stopPropagation();
												addExerciseToWorkout(ex);
											}}
										>
											+ Add to Workout
										</button>
									)}
								</div>
							</div>
						);
					})
				) : (
					<p className="no-results">No exercises found.</p>
				)}
			</div>

			{/* Custom Workout Builder Panel */}
			{showWorkoutBuilder && selectedExercises.length > 0 && (
				<div className="workout-builder-panel">
					<div className="workout-builder-header">
						<h3>💪 Your Custom Workout</h3>
						<div className="workout-summary">
							<span className="exercise-count">{selectedExercises.length} exercises</span>
							<span className="estimated-time">~{selectedExercises.length * 5} min</span>
						</div>
					</div>

					<div className="selected-exercises-list">
						{selectedExercises.map((exercise, index) => (
							<div key={exercise.exerciseId} className="selected-exercise">
								<div className="exercise-info">
									<span className="exercise-number">{index + 1}</span>
									<div className="exercise-details">
										<h4>{exercise.exerciseName}</h4>
										<div className="exercise-config">
											<input 
												type="number" 
												value={exercise.targetSets}
												onChange={(e) => updateExerciseConfig(exercise.exerciseId, 'targetSets', e.target.value)}
												min="1" max="10"
												className="config-input"
											/>
											<span>sets ×</span>
											<input 
												type="text" 
												value={exercise.targetReps}
												onChange={(e) => updateExerciseConfig(exercise.exerciseId, 'targetReps', e.target.value)}
												className="config-input"
											/>
											<span>reps</span>
										</div>
									</div>
								</div>
								<button 
									className="btn btn-danger btn-small"
									onClick={() => removeExerciseFromWorkout(exercise.exerciseId)}
								>
									🗑️
								</button>
							</div>
						))}
					</div>

					<div className="workout-builder-actions">
						<button 
							className="btn btn-primary"
							onClick={handleStartCustomWorkout}
							disabled={selectedExercises.length === 0}
						>
							🚀 Start Workout
						</button>
						<button 
							className="btn btn-secondary"
							onClick={handleSaveWorkoutAsTemplate}
						>
							💾 Save Template
						</button>
						<button 
							className="btn btn-outline"
							onClick={clearWorkout}
						>
							Clear All
						</button>
					</div>
				</div>
			)}

			{/* FAQ Section */}
			<div className="faq-section">
				<div className="faq-header">
					<h3>❓ Frequently Asked Questions</h3>
					<p>Everything you need to know about using our workout platform</p>
				</div>
				
				<div className="faq-grid">
					<div className="faq-item">
						<h4>How do I start a workout?</h4>
						<p>Click the "Start Workout" button and choose between premade workouts or build your own custom workout by selecting exercises.</p>
					</div>
					
					<div className="faq-item">
						<h4>Can I create my own workout templates?</h4>
						<p>Yes! Select exercises from the library, configure sets and reps, then save your custom workout as a template for future use.</p>
					</div>
					
					<div className="faq-item">
						<h4>How is my progress tracked?</h4>
						<p>Your workouts are automatically saved to history, and we track personal records, volume, and completion rates in your progress dashboard.</p>
					</div>
					
					<div className="faq-item">
						<h4>What equipment do I need?</h4>
						<p>Our exercise library includes bodyweight exercises and workouts for various equipment. Use the filter to find exercises that match your available equipment.</p>
					</div>
					
					<div className="faq-item">
						<h4>How do I view exercise details?</h4>
						<p>Click on any exercise card to see comprehensive information including instructions, muscle groups, and difficulty.</p>
					</div>
					
					<div className="faq-item">
						<h4>Can I modify workouts during a session?</h4>
						<p>Yes! You can add or remove exercises, adjust weights and reps, and modify your workout in real-time during your training session.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
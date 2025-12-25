import React, { useEffect, useState } from "react";
import "../App.css";
import exercisesData from "./gym_exercises.json";
import Filter from "./Filter";
import WorkoutTemplateBuilder from "./WorkoutTemplateBuilder";
import trackEvent from "../utils/trackEvent";
import { useNotifications, showWorkoutError, showWorkoutSuccess } from "../utils/notifications";
import { API_CONFIG, api, handleAuthError } from "../utils/api.js";

export default function Exercises({ onStartWorkout, onViewProfile, onViewHistory, onCreateTemplate, onEditTemplate, onQuickWorkout }) {
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
	const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState(null);
	
	const [showWorkoutStarter, setShowWorkoutStarter] = useState(false);
	const [expandedInstructions, setExpandedInstructions] = useState(new Set());
	
	// Hover tracking state
	const [hoverTimers, setHoverTimers] = useState({});
	const [instructionViewTimers, setInstructionViewTimers] = useState({});
	

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

// Load exercises and user data
	useEffect(() => {
		setExercises(exercisesData);
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
			console.error('Error fetching templates:', error);
		}
	};
	
	const fetchPersonalRecords = async () => {
		try {
			const data = await api.get('/api/workouts/records');
			const recordsMap = {};
			data.records.forEach(record => {
				recordsMap[record.exerciseId] = record;
			});
			setPersonalRecords(recordsMap);
		} catch (error) {
			// Handle authentication errors specifically
			if (handleAuthError(error)) {
				return; // Don't show additional error message, function will handle logout
			}
			console.error('Error fetching personal records:', error);
		}
	};

	if (loading) return <p className="loading-text">Loading exercises...</p>;

	// Filtering logic
	const filteredExercises = exercises.filter((ex) => {
		const matchMuscle =
			!filters.muscleGroup || ex.muscleGroup === filters.muscleGroup;
		const matchEquipment =
			!filters.equipment || ex.equipment.includes(filters.equipment);
		const matchDifficulty =
			!filters.difficulty || ex.difficulty === filters.difficulty;

		return matchMuscle && matchEquipment && matchDifficulty;
	});

	

	
	
	
	
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
	
// Handle template builder actions
	const handleCreateTemplate = async (templateData) => {
		try {
			const isEditing = editingTemplate && editingTemplate._id;
			let result;
			
			if (isEditing) {
				result = await api.put(`${API_CONFIG.ENDPOINTS.WORKOUT_TEMPLATE}/${editingTemplate._id}`, templateData);
				setTemplates(prev => prev.map(t => t._id === editingTemplate._id ? result.template : t));
				showSuccess('Template updated successfully!');
			} else {
				result = await api.post(API_CONFIG.ENDPOINTS.WORKOUT_TEMPLATE, templateData);
				setTemplates(prev => [...prev, result.template]);
				showSuccess('Template created successfully!');
			}
			
			setShowTemplateBuilder(false);
			setEditingTemplate(null);
		} catch (error) {
			console.error('Error saving template:', error);
			showWorkoutError(error, `${isEditing ? 'update' : 'create'} template`, showError);
		}
	};

	// Handle template deletion
	const handleDeleteTemplate = async (templateId) => {
		if (!window.confirm('Are you sure you want to delete this template?')) {
			return;
		}

		try {
			await api.delete(`${API_CONFIG.ENDPOINTS.WORKOUT_TEMPLATE}/${templateId}`);
			setTemplates(prev => prev.filter(t => t._id !== templateId));
			showSuccess('Template deleted successfully!');
		} catch (error) {
			// Handle authentication errors specifically
			if (handleAuthError(error)) {
				return; // Don't show additional error message, function will handle logout
			}
			showWorkoutError(error, `${isEditing ? 'update' : 'create'} template`, showError);
		}
	};

	// Handle starting workout from template
	const handleStartWorkoutFromTemplate = async (template) => {
		try {
			const session = await api.post(API_CONFIG.ENDPOINTS.WORKOUT_SESSION, {
				workoutTemplateId: template._id
			});
			
			// Navigate to workout session (assuming this is handled by parent component)
			if (onStartWorkout) {
				onStartWorkout(session);
			}
		} catch (error) {
			// Handle authentication errors specifically
			if (handleAuthError(error)) {
				return; // Don't show additional error message, function will handle logout
			}
			showWorkoutError(error, 'workout start from template', showError);
		}
	};
	
	

	return (
		<div className="exercise-container">
			{/* Header with actions */}
			<div className="exercises-header">
				<h2 className="exercise-title">Gym Exercises</h2>
				
				<div className="exercises-actions">
					{onStartWorkout && (
						<button 
							onClick={() => setShowWorkoutStarter(true)}
							className="btn btn-primary start-workout-btn"
						>
							🏋️ Start Workout
						</button>
					)}
					
					{onQuickWorkout && (
						<button 
							onClick={() => {
								onQuickWorkout();
							}}
							className="btn btn-primary quick-workout-btn"
						>
							🏋️ Workout Center
						</button>
					)}
					
					{onCreateTemplate && (
						<button 
							onClick={() => {
								onCreateTemplate();
							}}
							className="btn btn-secondary create-template-btn"
						>
							📝 Create Template
						</button>
					)}
					
					{onViewHistory && (
						<button 
							onClick={onViewHistory}
							className="btn btn-secondary history-btn"
						>
							📊 Workout History
						</button>
					)}
					
					{onViewProfile && (
						<button 
							onClick={onViewProfile}
							className="btn btn-secondary profile-btn"
						>
							👤 My Progress
						</button>
					)}
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
							<div className="feature-icon">🏋️</div>
							<h5>Smart Workouts</h5>
							<p>Track every set, rep, and personal record with precision</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">📝</div>
							<h5>Custom Templates</h5>
							<p>Create and save personalized workout routines for any fitness goal</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">📊</div>
							<h5>Progress Analytics</h5>
							<p>Monitor your improvement with detailed performance insights</p>
						</div>
					</div>
					
					<div className="intro-call-to-action">
						<p>
							<strong>Ready to transform your fitness?</strong> Start by browsing our exercise library 
							or create your first custom workout template. Your journey to better health begins here!
						</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<Filter
				filters={filters}
				setFilters={setFilters}
				allExercises={exercises}
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
										<button 
											onClick={() => handleStartWorkoutFromTemplate(template)}
											className="btn btn-small btn-success"
											title="Start workout from this template"
										>
											▶️
										</button>
									</div>
								</div>
								<p className="template-description">{template.description}</p>
								<div className="template-meta">
									<span className="template-category">{template.category}</span>
									<span className="template-exercises-count">{template.exercises.length} exercises</span>
								</div>
								<div className="template-exercises-preview">
									{template.exercises.slice(0, 3).map((ex, idx) => (
										<span key={idx} className="exercise-chip">
											{ex.exerciseName}
										</span>
									))}
									{template.exercises.length > 3 && (
										<span className="exercise-chip more">+{template.exercises.length - 3} more</span>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="no-templates">
						<p>You haven't created any workout templates yet.</p>
						<p>Click "Create Template" to get started!</p>
					</div>
				)}
			</div>

			{/* Exercise grid */}
			<div className="exercise-grid enhanced">
				{filteredExercises.length > 0 ? (
					filteredExercises.map((ex) => {
						const isInTemplates = isExerciseInTemplates(ex.id);
						const completionCount = getExerciseCompletionCount(ex.id);
						const personalRecord = personalRecords[ex.id];
						
						return (
							<div
								key={ex.id}
								className={`exercise-card enhanced ${isInTemplates ? 'in-templates' : ''}`}
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

								
							</div>
						);
					})
				) : (
					<p className="no-results">No exercises found.</p>
				)}
			</div>
			
			{/* Template Builder Modal */}
			{showTemplateBuilder && (
				<div className="modal-overlay" onClick={() => {
					setShowTemplateBuilder(false);
					setEditingTemplate(null);
				}}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<WorkoutTemplateBuilder
							onSave={handleCreateTemplate}
							onCancel={() => {
								setShowTemplateBuilder(false);
								setEditingTemplate(null);
							}}
							initialTemplate={editingTemplate}
						/>
					</div>
				</div>
			)}

			{/* Workout Starter Modal */}
			{showWorkoutStarter && (
				<div className="modal-overlay" onClick={() => setShowWorkoutStarter(false)}>
					<div className="modal-content workout-starter-modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Start Your Workout</h2>
							<button 
								className="close-btn"
								onClick={() => setShowWorkoutStarter(false)}
							>
								×
							</button>
						</div>
						<div className="modal-body">
							<div className="workout-options">
								{/* Quick Start Option */}
								<div className="workout-option">
									<h3>🏃 Quick Start</h3>
									<p>Start an empty workout and add exercises as you go</p>
									<button 
										onClick={() => {
											try {
												onStartWorkout();
												setShowWorkoutStarter(false);
											} catch (error) {
												console.error('Error starting workout:', error);
												showWorkoutError(error, 'quick workout start', showError);
											}
										}}
										className="btn btn-primary"
									>
										Start Empty Workout
									</button>
								</div>

								{/* Templates Option */}
								<div className="workout-option">
									<h3>📋 Use Template</h3>
									<p>Choose from your saved workout templates</p>
									<div className="templates-selection">
										{templates.length > 0 ? (
											templates.map(template => (
												<div key={template._id} className="template-option">
													<div className="template-info">
														<h4>{template.name}</h4>
														<p>{template.category} • {template.exercises.length} exercises</p>
													</div>
													<button 
														onClick={() => {
															try {
																handleStartWorkoutFromTemplate(template);
																setShowWorkoutStarter(false);
		} catch (error) {
			// Handle authentication errors specifically
			if (handleAuthError(error)) {
				return; // Don't show additional error message, function will handle logout
			}
			showWorkoutError(error, `${editingTemplate ? 'update' : 'create'} template`, showError);
		}
														}}
														className="btn btn-secondary btn-small"
													>
														Start
													</button>
												</div>
											))
										) : (
											<div className="no-templates-option">
												<p>No templates yet</p>
												<button 
													onClick={() => {
														setShowWorkoutStarter(false);
														setEditingTemplate(null);
														setShowTemplateBuilder(true);
													}}
													className="btn btn-outline"
												>
													Create First Template
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			
			
		</div>
	);
}

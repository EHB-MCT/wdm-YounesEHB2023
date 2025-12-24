import React, { useState, useEffect } from "react";
import exercisesData from "./gym_exercises.json";
import trackEvent from "../utils/trackEvent";

// Add custom CSS for custom exercises
const customStyles = `
	.custom-exercise {
		border: 2px solid #007bff !important;
		background-color: #f8f9ff !important;
	}
	.custom-badge {
		background-color: #007bff;
		color: white;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		margin-left: 5px;
	}
	.custom-label {
		color: #007bff;
		font-weight: normal;
		font-size: 0.9em;
	}
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 15px;
		margin-bottom: 20px;
	}
	.create-custom-btn {
		background-color: #28a745;
	}
	.exercise-library-card .card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 15px;
	}
	.btn-close {
		background-color: #dc3545;
		color: white;
		border: none;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
`;

export default function QuickWorkoutStarter({ onStartWorkout, onBack }) {
	// Inject custom styles
	useEffect(() => {
		const styleElement = document.createElement('style');
		styleElement.textContent = customStyles;
		document.head.appendChild(styleElement);
		
		return () => {
			document.head.removeChild(styleElement);
		};
	}, []);
	const [selectedExercises, setSelectedExercises] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [expandedExerciseDetails, setExpandedExerciseDetails] = useState(new Set());
	const [workoutName, setWorkoutName] = useState("");
	const [isStarting, setIsStarting] = useState(false);
	const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
	const [customExercise, setCustomExercise] = useState({
		name: "",
		muscleGroup: "Custom",
		equipment: "Bodyweight",
		difficulty: "Beginner",
		targetSets: 3,
		targetReps: "10",
		targetWeight: 0,
		restTime: 60,
		instructions: []
	});
	
	const muscleGroups = [...new Set(exercisesData.map(ex => ex.muscleGroup))];
	
	const filteredExercises = exercisesData.filter(exercise => {
		const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === "all" || exercise.muscleGroup === selectedCategory;
		return matchesSearch && matchesCategory;
	});
	
	const addCustomExercise = () => {
		if (!customExercise.name.trim()) {
			alert('Please enter an exercise name');
			return;
		}

		const newExercise = {
			exerciseId: `custom_${Date.now()}`, // Unique ID for custom exercises
			exerciseName: customExercise.name,
			muscleGroup: customExercise.muscleGroup,
			equipment: customExercise.equipment,
			difficulty: customExercise.difficulty,
			targetSets: customExercise.targetSets,
			targetReps: customExercise.targetReps,
			targetWeight: customExercise.targetWeight,
			restTime: customExercise.restTime,
			exerciseRestTime: 90,
			instructions: customExercise.instructions,
			isCustom: true
		};

		const newSelectedExercises = [...selectedExercises, newExercise];
		setSelectedExercises(newSelectedExercises);

		// Reset form
		setCustomExercise({
			name: "",
			muscleGroup: "Custom",
			equipment: "Bodyweight",
			difficulty: "Beginner",
			targetSets: 3,
			targetReps: "10",
			targetWeight: 0,
			restTime: 60,
			instructions: []
		});
		setShowCustomExerciseForm(false);

		console.log(`✓ Successfully added custom exercise: ${newExercise.exerciseName}`);
	};

	const addExercise = (exercise) => {
		console.log('=== ADDING EXERCISE TO QUICK WORKOUT ===');
		console.log('Exercise data:', exercise);
		console.log('Current selected exercises:', selectedExercises);
		
		// Simple check - just use the exercise ID directly
		const isAlreadyAdded = selectedExercises.some(ex => ex.exerciseId === exercise.id);
		
		console.log('Exercise ID:', exercise.id);
		console.log('Is already added:', isAlreadyAdded);
		
		if (isAlreadyAdded) {
			console.log('Exercise already added:', exercise.name);
			alert('Exercise already added to your workout!');
			return;
		}

		// Create new exercise with minimal data first
		const newExercise = {
			exerciseId: exercise.id,
			exerciseName: exercise.name,
			muscleGroup: exercise.muscleGroup,
			targetSets: 3,
			targetReps: "10",
			targetWeight: 0,
			restTime: 60,
			equipment: exercise.equipment,
			difficulty: exercise.difficulty
		};
		
		console.log('New exercise object:', newExercise);
		
		// Simple state update
		const newSelectedExercises = [...selectedExercises, newExercise];
		console.log('Setting new selected exercises:', newSelectedExercises);
		setSelectedExercises(newSelectedExercises);
		
		console.log(`✓ Successfully added exercise: ${exercise.name} to quick workout`);
	};
	
	const removeExercise = (exerciseId) => {
		setSelectedExercises(selectedExercises.filter(ex => String(ex.exerciseId) !== String(exerciseId)));
	};
	
	const moveExercise = (index, direction) => {
		const newExercises = [...selectedExercises];
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		
		if (newIndex >= 0 && newIndex < newExercises.length) {
			[newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
			setSelectedExercises(newExercises);
		}
	};
	
	const updateExercise = (exerciseId, field, value) => {
		const updatedExercises = selectedExercises.map(ex => 
			String(ex.exerciseId) === String(exerciseId) ? { ...ex, [field]: value } : ex
		);
		setSelectedExercises(updatedExercises);
	};
	
	const toggleExerciseDetails = (exerciseId) => {
		const newExpanded = new Set(expandedExerciseDetails);
		if (newExpanded.has(exerciseId)) {
			newExpanded.delete(exerciseId);
		} else {
			newExpanded.add(exerciseId);
		}
		setExpandedExerciseDetails(newExpanded);
	};
	
	const startWorkout = async () => {
		if (selectedExercises.length === 0) {
			alert("Please add at least one exercise");
			return;
		}
		
		const workoutName = document.getElementById('workout-name').value.trim() || "Quick Workout";
		
		setIsStarting(true);
		
		try {
			trackEvent("quick_workout_start", {
				workoutName,
				exerciseCount: selectedExercises.length
			});
			
			// Create a quick workout session
			const response = await fetch('http://localhost:5000/api/workouts/session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({
					templateId: null,
					templateName: workoutName,
					exercises: selectedExercises.map(ex => ({
						exerciseId: ex.exerciseId,
						exerciseName: ex.exerciseName,
						targetSets: ex.targetSets,
						targetReps: ex.targetReps,
						targetWeight: ex.targetWeight,
						restTime: ex.restTime,
						equipment: ex.equipment,
						difficulty: ex.difficulty,
						video: ex.video,
						instructions: ex.instructions
					}))
				})
			});
			
			const data = await response.json();
			
			if (response.ok) {
				onStartWorkout(data);
			} else {
				throw new Error(data.error || 'Failed to start workout');
			}
		} catch (error) {
			console.error('Error starting workout:', error);
			alert('Error starting workout. Please try again.');
		} finally {
			setIsStarting(false);
		}
	};
	
	return (
		<div className="quick-workout-starter">
			{/* Header */}
			<header className="quick-workout-header">
				<div className="header-content">
					{onBack && (
						<button onClick={onBack} className="btn btn-secondary back-btn">
							← Back
						</button>
					)}
					<div className="header-text">
						<h1>Quick Workout</h1>
						<p>Choose your exercises and start working out immediately</p>
					</div>
				</div>
			</header>

			<main className="quick-workout-main">
				

				{/* Workout Setup */}
				<section className="workout-setup-card">
					<div className="card-header">
						<h2>Workout Setup</h2>
						<div className="exercise-count-badge">{selectedExercises.length} exercises</div>
					</div>
					<div className="card-content">
						<div className="form-group">
							<label htmlFor="workout-name">Workout Name</label>
							<input
								id="workout-name"
								type="text"
								value={workoutName}
								onChange={(e) => setWorkoutName(e.target.value)}
								placeholder="e.g., Morning Quick Workout"
								maxLength={100}
								className="form-input"
							/>
							<small className="form-hint">Optional - name your workout for tracking</small>
						</div>
						
						<button 
							onClick={startWorkout}
							disabled={selectedExercises.length === 0 || isStarting}
							className="btn btn-primary start-workout-btn"
						>
							{isStarting ? "Starting..." : "Start Workout"}
						</button>
					</div>
				</section>

				{/* Selected Exercises */}
				{selectedExercises.length > 0 && (
					<section className="selected-exercises-card">
						<div className="card-header">
							<h2>Your Exercises</h2>
							<span className="exercise-count">{selectedExercises.length} exercises</span>
						</div>
						
						<div className="card-content">
							<div className="exercises-list">
								{selectedExercises.map((exercise, index) => (
									<div key={exercise.exerciseId} className={`exercise-card ${exercise.isCustom ? 'custom-exercise' : ''}`}>
										<div className="exercise-card-header">
											<div className="exercise-order">
												<span className="order-number">{index + 1}</span>
												{exercise.isCustom && <span className="custom-badge">👤</span>}
											</div>
											<div className="exercise-info">
												<h3>
													{exercise.exerciseName}
													{exercise.isCustom && <span className="custom-label"> (Custom)</span>}
												</h3>
												<div className="exercise-meta">
													<span className="muscle-group">{exercise.muscleGroup}</span>
													<span className="separator">•</span>
													<span className="difficulty">{exercise.difficulty}</span>
													<span className="separator">•</span>
													<span className="equipment">{exercise.equipment}</span>
												</div>
											</div>
											<div className="exercise-controls">
												<div className="reorder-controls">
													<button
														onClick={() => moveExercise(index, 'up')}
														disabled={index === 0}
														className="btn-icon btn-up"
														title="Move up"
													>
														↑
													</button>
													<button
														onClick={() => moveExercise(index, 'down')}
														disabled={index === selectedExercises.length - 1}
														className="btn-icon btn-down"
														title="Move down"
													>
														↓
													</button>
												</div>
												<button
													onClick={() => removeExercise(exercise.exerciseId)}
													className="btn-icon btn-remove"
													title="Remove exercise"
												>
													✕
												</button>
											</div>
										</div>
										
										<div className="exercise-settings">
											<div className="settings-grid">
												<div className="setting-item">
													<label>Sets</label>
													<input
														type="number"
														min="1"
														max="10"
														value={exercise.targetSets}
														onChange={(e) => updateExercise(exercise.exerciseId, 'targetSets', parseInt(e.target.value))}
														className="setting-input"
													/>
												</div>
												
												<div className="setting-item">
													<label>Reps</label>
													<input
														type="text"
														value={exercise.targetReps}
														onChange={(e) => updateExercise(exercise.exerciseId, 'targetReps', e.target.value)}
														placeholder="e.g., 10 or 8-12"
														className="setting-input"
													/>
												</div>
												
												<div className="setting-item">
													<label>Weight (kg)</label>
													<input
														type="number"
														min="0"
														step="0.5"
														value={exercise.targetWeight}
														onChange={(e) => updateExercise(exercise.exerciseId, 'targetWeight', parseFloat(e.target.value))}
														className="setting-input"
													/>
												</div>
												
												<div className="setting-item">
													<label>Rest (sec)</label>
													<input
														type="number"
														min="0"
														max="600"
														value={exercise.restTime}
														onChange={(e) => updateExercise(exercise.exerciseId, 'restTime', parseInt(e.target.value))}
														className="setting-input"
													/>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>
				)}

				{/* Custom Exercise Form */}
				{showCustomExerciseForm && (
					<section className="custom-exercise-card">
						<div className="card-header">
							<h2>Create Custom Exercise</h2>
							<button 
								onClick={() => setShowCustomExerciseForm(false)}
								className="btn-icon btn-close"
								title="Close form"
							>
								✕
							</button>
						</div>
						<div className="card-content">
							<div className="form-grid">
								<div className="form-group">
									<label>Exercise Name *</label>
									<input
										type="text"
										value={customExercise.name}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
										placeholder="e.g., My Custom Push-up"
										className="form-input"
									/>
								</div>
								
								<div className="form-group">
									<label>Muscle Group</label>
									<select
										value={customExercise.muscleGroup}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, muscleGroup: e.target.value }))}
										className="form-select"
									>
										<option value="Custom">Custom</option>
										<option value="Chest">Chest</option>
										<option value="Back">Back</option>
										<option value="Shoulders">Shoulders</option>
										<option value="Arms">Arms</option>
										<option value="Legs">Legs</option>
										<option value="Glutes">Glutes</option>
										<option value="Core">Core</option>
										<option value="Cardio">Cardio</option>
										<option value="Full Body">Full Body</option>
									</select>
								</div>
								
								<div className="form-group">
									<label>Equipment</label>
									<select
										value={customExercise.equipment}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, equipment: e.target.value }))}
										className="form-select"
									>
										<option value="Bodyweight">Bodyweight</option>
										<option value="Dumbbells">Dumbbells</option>
										<option value="Barbell">Barbell</option>
										<option value="Kettlebells">Kettlebells</option>
										<option value="Resistance Bands">Resistance Bands</option>
										<option value="Machine">Machine</option>
										<option value="Cable">Cable</option>
										<option value="Medicine Ball">Medicine Ball</option>
										<option value="Other">Other</option>
									</select>
								</div>
								
								<div className="form-group">
									<label>Difficulty</label>
									<select
										value={customExercise.difficulty}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, difficulty: e.target.value }))}
										className="form-select"
									>
										<option value="Beginner">Beginner</option>
										<option value="Intermediate">Intermediate</option>
										<option value="Advanced">Advanced</option>
									</select>
								</div>
								
								<div className="form-group">
									<label>Sets</label>
									<input
										type="number"
										min="1"
										max="10"
										value={customExercise.targetSets}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, targetSets: parseInt(e.target.value) }))}
										className="form-input"
									/>
								</div>
								
								<div className="form-group">
									<label>Reps</label>
									<input
										type="text"
										value={customExercise.targetReps}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, targetReps: e.target.value }))}
										placeholder="e.g., 10 or 8-12"
										className="form-input"
									/>
								</div>
								
								<div className="form-group">
									<label>Weight (kg)</label>
									<input
										type="number"
										min="0"
										step="0.5"
										value={customExercise.targetWeight}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) }))}
										className="form-input"
									/>
								</div>
								
								<div className="form-group">
									<label>Rest Time (seconds)</label>
									<input
										type="number"
										min="0"
										max="600"
										value={customExercise.restTime}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, restTime: parseInt(e.target.value) }))}
										className="form-input"
									/>
								</div>
							</div>
							
							<div className="form-actions">
								<button 
									onClick={() => setShowCustomExerciseForm(false)}
									className="btn btn-secondary"
								>
									Cancel
								</button>
								<button 
									onClick={addCustomExercise}
									className="btn btn-primary"
								>
									Add Custom Exercise
								</button>
							</div>
						</div>
					</section>
				)}

				{/* Exercise Library */}
				<section className="exercise-library-card">
					<div className="card-header">
						<div className="header-left">
							<h2>Exercise Library</h2>
							<div className="library-stats">
								{filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
							</div>
						</div>
						<button 
							onClick={() => setShowCustomExerciseForm(true)}
							className="btn btn-primary create-custom-btn"
						>
							➕ Create Custom Exercise
						</button>
					</div>
					
					<div className="library-filters">
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="filter-select"
						>
							<option value="all">All Muscle Groups</option>
							{muscleGroups.map(group => (
								<option key={group} value={group}>{group}</option>
							))}
						</select>
						
						<div className="search-box">
							<input
								type="text"
								placeholder="Search exercises by name..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="search-input"
							/>
							<div className="search-icon">🔍</div>
						</div>
					</div>
					
					<div className="exercise-grid">
						{filteredExercises.map(exercise => {
							const isAdded = selectedExercises.some(ex => ex.exerciseId === exercise.id);
							const isExpanded = expandedExerciseDetails.has(exercise.id);
							
							// Debug logging for each exercise
							console.log(`Exercise: ${exercise.name}, ID: ${exercise.id}, isAdded: ${isAdded}`);
							console.log('Selected exercises IDs:', selectedExercises.map(ex => ex.exerciseId));
							return (
								<div
									key={exercise.id}
									className={`exercise-tile ${isAdded ? 'added' : ''} ${isExpanded ? 'expanded' : ''}`}
								>
									<div className="exercise-tile-header">
										<div className="exercise-tile-content">
											<h3>{exercise.name}</h3>
											<div className="exercise-tags">
												<span className="tag muscle">{exercise.muscleGroup}</span>
												<span className="tag difficulty">{exercise.difficulty}</span>
											</div>
											<div className="equipment-info">
												🏋️ {exercise.equipment}
											</div>
										</div>
										
										<div className="exercise-tile-actions">
											<button 
												className="btn-icon expand-btn"
												onClick={(e) => {
													e.stopPropagation();
													toggleExerciseDetails(exercise.id);
												}}
												title={isExpanded ? "Hide details" : "Show details"}
											>
												{isExpanded ? '▼' : '▶'}
											</button>
											{!isAdded ? (
												<button 
													className="btn btn-add"
													onClick={() => {
														console.log('=== QUICK WORKOUT ADD BUTTON CLICKED ===');
														console.log('Adding exercise:', exercise.name, 'ID:', exercise.id);
														console.log('Exercise object:', exercise);
														console.log('isAdded value:', isAdded);
														addExercise(exercise);
													}}
													style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
												>
													+ Add
												</button>
											) : (
												<span className="added-badge" style={{ color: 'green', fontWeight: 'bold' }}>✓ Added</span>
											)}
										</div>
									</div>
									
									{isExpanded && (
										<div className="exercise-details">
											{exercise.video ? (
												<div className="video-container">
													<video className="exercise-video" controls preload="metadata">
														<source src={exercise.video} type="video/mp4" />
														Your browser does not support the video tag.
													</video>
												</div>
											) : (
												<div className="no-video">
													<div className="no-video-icon">📹</div>
													<p>No video available</p>
												</div>
											)}
											
											{exercise.instructions && exercise.instructions.length > 0 && (
												<div className="instructions">
													<h4>Instructions:</h4>
													<ol>
														{exercise.instructions.map((instruction, idx) => (
															<li key={idx}>{instruction}</li>
														))}
													</ol>
												</div>
											)}
											
											<div className="exercise-meta-details">
												<div className="meta-row">
													<span className="meta-label">Equipment:</span>
													<span className="meta-value">{exercise.equipment}</span>
												</div>
												<div className="meta-row">
													<span className="meta-label">Difficulty:</span>
													<span className="meta-value">{exercise.difficulty}</span>
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</section>
			</main>
		</div>
	);
}
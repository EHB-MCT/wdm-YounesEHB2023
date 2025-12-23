import React, { useState, useEffect } from "react";
import exercisesData from "./gym_exercises.json";
import trackEvent from "../utils/trackEvent";

export default function WorkoutTemplateBuilder({ onSave, onCancel, initialTemplate = null }) {
	const [template, setTemplate] = useState({
		name: initialTemplate?.name || "",
		description: initialTemplate?.description || "",
		category: initialTemplate?.category || "Custom",
		exercises: initialTemplate?.exercises || [],
		tags: initialTemplate?.tags || []
	});
	
	const [selectedExercises, setSelectedExercises] = useState([]);
	const [currentExercise, setCurrentExercise] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isSaving, setIsSaving] = useState(false);
	const [expandedExerciseDetails, setExpandedExerciseDetails] = useState(new Set());
	
	const muscleGroups = [...new Set(exercisesData.map(ex => ex.muscleGroup))];
	const categories = ["Upper Body", "Lower Body", "Full Body", "Core", "Cardio", "Custom"];
	
	const filteredExercises = exercisesData.filter(exercise => {
		const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === "all" || exercise.muscleGroup === selectedCategory;
		return matchesSearch && matchesCategory;
	});
	
	const addExerciseToTemplate = (exercise) => {
		const newExercise = {
			exerciseId: exercise.id,
			exerciseName: exercise.name,
			muscleGroup: exercise.muscleGroup,
			targetSets: 3,
			targetReps: "10",
			targetWeight: 0,
			restTime: 60,
			exerciseRestTime: 90,
			equipment: exercise.equipment,
			difficulty: exercise.difficulty,
			video: exercise.video,
			instructions: exercise.instructions
		};
		
		const updatedExercises = [...template.exercises, newExercise];
		setTemplate(prev => ({ ...prev, exercises: updatedExercises }));
		setSelectedExercises([...selectedExercises, exercise.id]);
		
		trackEvent("template_exercise_added", {
			exerciseId: exercise.id,
			exerciseName: exercise.name,
			muscleGroup: exercise.muscleGroup,
			templateName: template.name || "New Template"
		});
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
	
	const removeExerciseFromTemplate = (exerciseId) => {
		const updatedExercises = template.exercises.filter(ex => ex.exerciseId !== exerciseId);
		setTemplate(prev => ({ ...prev, exercises: updatedExercises }));
		setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
		
		trackEvent("template_exercise_removed", {
			exerciseId,
			templateName: template.name || "New Template"
		});
	};
	
	const updateExerciseInTemplate = (exerciseId, field, value) => {
		const updatedExercises = template.exercises.map(ex => 
			ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
		);
		setTemplate(prev => ({ ...prev, exercises: updatedExercises }));
	};
	
	const moveExercise = (index, direction) => {
		const newExercises = [...template.exercises];
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		
		if (newIndex >= 0 && newIndex < newExercises.length) {
			[newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
			setTemplate(prev => ({ ...prev, exercises: newExercises }));
		}
	};
	
	const suggestCategory = () => {
		if (template.exercises.length === 0) return;
		
		const muscleGroups = template.exercises.map(ex => ex.muscleGroup);
		const groupCounts = {};
		
		muscleGroups.forEach(group => {
			groupCounts[group] = (groupCounts[group] || 0) + 1;
		});
		
		const totalExercises = template.exercises.length;
		const topGroup = Object.entries(groupCounts).sort(([,a], [,b]) => b - a)[0];
		
		if (!topGroup) return;
		
		const [group, count] = topGroup;
		let suggestedCategory = "Custom";
		
		if (count / totalExercises >= 0.7) {
			const upperBodyGroups = ['chest', 'back', 'shoulders', 'arms'];
			const lowerBodyGroups = ['legs', 'glutes'];
			
			if (upperBodyGroups.some(ub => group.toLowerCase().includes(ub))) {
				suggestedCategory = "Upper Body";
			} else if (lowerBodyGroups.some(lb => group.toLowerCase().includes(lb))) {
				suggestedCategory = "Lower Body";
			} else if (group.toLowerCase().includes('core')) {
				suggestedCategory = "Core";
			}
		} else {
			const hasUpper = muscleGroups.some(g => 
				['chest', 'back', 'shoulders', 'arms'].some(ub => g.toLowerCase().includes(ub)));
			const hasLower = muscleGroups.some(g => 
				['legs', 'glutes'].some(lb => g.toLowerCase().includes(lb)));
			
			if (hasUpper && hasLower) {
				suggestedCategory = "Full Body";
			}
		}
		
		setTemplate(prev => ({ ...prev, category: suggestedCategory }));
	};
	
	useEffect(() => {
		if (template.exercises.length > 0 && template.category === "Custom") {
			suggestCategory();
		}
	}, [template.exercises]);
	
	const handleSave = async () => {
		if (!template.name.trim()) {
			alert("Please enter a template name");
			return;
		}
		
		if (template.exercises.length === 0) {
			alert("Please add at least one exercise");
			return;
		}
		
		setIsSaving(true);
		
		try {
			trackEvent("template_save_attempt", {
				name: template.name,
				category: template.category,
				exerciseCount: template.exercises.length,
				isEdit: !!initialTemplate
			});
			
			await onSave(template);
			
			trackEvent("template_save_success", {
				name: template.name,
				category: template.category,
				exerciseCount: template.exercises.length
			});
		} catch (error) {
			console.error("Error saving template:", error);
			alert("Error saving template. Please try again.");
			
			trackEvent("template_save_error", {
				name: template.name,
				error: error.message
			});
		} finally {
			setIsSaving(false);
		}
	};
	
	return (
		<div className="workout-template-builder">
			{/* Header Section */}
			<header className="template-builder-header">
				<div className="header-content">
					<div className="header-text">
						<h1>{initialTemplate ? "Edit Workout Template" : "Create Workout Template"}</h1>
						<p>Design your perfect workout routine by adding exercises and configuring sets, reps, and rest periods</p>
					</div>
					<div className="header-actions">
						<button 
							onClick={onCancel} 
							className="btn btn-secondary"
							disabled={isSaving}
						>
							Cancel
						</button>
						<button 
							onClick={handleSave} 
							className="btn btn-primary"
							disabled={isSaving}
						>
							{isSaving ? "Saving..." : (initialTemplate ? "Update Template" : "Save Template")}
						</button>
					</div>
				</div>
			</header>

			<main className="template-builder-main">
				{/* Template Information Card */}
				<section className="template-info-card">
					<div className="card-header">
						<h2>Template Information</h2>
						<div className="card-icon">📝</div>
					</div>
					<div className="card-content">
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="template-name">Template Name *</label>
								<input
									id="template-name"
									type="text"
									value={template.name}
									onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
									placeholder="e.g., Monday Upper Body"
									maxLength={100}
									className="form-input"
								/>
								<small className="form-hint">Give your workout a memorable name</small>
							</div>
							
							<div className="form-group">
								<label htmlFor="template-category">Category</label>
								<select
									id="template-category"
									value={template.category}
									onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
									className="form-select"
								>
									{categories.map(cat => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
								<small className="form-hint">Auto-suggested based on exercises</small>
							</div>
						</div>
						
						<div className="form-group">
							<label htmlFor="template-description">Description</label>
							<textarea
								id="template-description"
								value={template.description}
								onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
								placeholder="Describe the focus of this workout, goals, or any special notes..."
								maxLength={500}
								rows={3}
								className="form-textarea"
							/>
							<small className="form-hint">Optional: Help users understand when to use this template</small>
						</div>
					</div>
				</section>

				{/* Template Exercises Section */}
				<section className="template-exercises-card">
					<div className="card-header">
						<div className="header-left">
							<h2>Workout Exercises</h2>
							<span className="exercise-count">{template.exercises.length} exercises</span>
						</div>
						{template.exercises.length > 0 && (
							<div className="category-badge">
								{template.category}
							</div>
						)}
					</div>
					
					<div className="card-content">
						{template.exercises.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">🏋️</div>
								<h3>No exercises added yet</h3>
								<p>Start building your workout by adding exercises from the exercise library below</p>
							</div>
						) : (
							<div className="exercises-list">
								{template.exercises.map((exercise, index) => (
									<div key={exercise.exerciseId} className="exercise-card">
										<div className="exercise-card-header">
											<div className="exercise-order">
												<span className="order-number">{index + 1}</span>
											</div>
											<div className="exercise-info">
												<h3>{exercise.exerciseName}</h3>
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
														aria-label="Move exercise up"
													>
														↑
													</button>
													<button
														onClick={() => moveExercise(index, 'down')}
														disabled={index === template.exercises.length - 1}
														className="btn-icon btn-down"
														title="Move down"
														aria-label="Move exercise down"
													>
														↓
													</button>
												</div>
												<button
													onClick={() => removeExerciseFromTemplate(exercise.exerciseId)}
													className="btn-icon btn-remove"
													title="Remove exercise"
													aria-label="Remove exercise"
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
														onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'targetSets', parseInt(e.target.value))}
														className="setting-input"
													/>
												</div>
												
												<div className="setting-item">
													<label>Reps</label>
													<input
														type="text"
														value={exercise.targetReps}
														onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'targetReps', e.target.value)}
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
														onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'targetWeight', parseFloat(e.target.value))}
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
														onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'restTime', parseInt(e.target.value))}
														className="setting-input"
													/>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</section>

				{/* Exercise Library Section */}
				<section className="exercise-library-card">
					<div className="card-header">
						<h2>Exercise Library</h2>
						<div className="library-stats">
							{filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
						</div>
					</div>
					
					<div className="library-filters">
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
					</div>
					
					<div className="exercise-grid">
						{filteredExercises.map(exercise => {
							const isAdded = selectedExercises.includes(exercise.id);
							const isExpanded = expandedExerciseDetails.has(exercise.id);
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
												onClick={() => toggleExerciseDetails(exercise.id)}
												title={isExpanded ? "Hide details" : "Show details"}
												aria-expanded={isExpanded}
											>
												{isExpanded ? '▼' : '▶'}
											</button>
											{!isAdded ? (
												<button 
													className="btn btn-add"
													onClick={() => addExerciseToTemplate(exercise)}
												>
													+ Add
												</button>
											) : (
												<span className="added-badge">✓ Added</span>
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
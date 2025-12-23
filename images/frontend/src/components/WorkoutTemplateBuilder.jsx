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
			<div className="template-builder-header">
				<h2>{initialTemplate ? "Edit Workout Template" : "Create Workout Template"}</h2>
				<div className="template-builder-actions">
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
			
			<div className="template-builder-content">
				<div className="template-info-section">
					<div className="form-group">
						<label>Template Name *</label>
						<input
							type="text"
							value={template.name}
							onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
							placeholder="e.g., Monday Upper Body"
							maxLength={100}
						/>
					</div>
					
					<div className="form-group">
						<label>Category</label>
						<select
							value={template.category}
							onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
						>
							{categories.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
					</div>
					
					<div className="form-group">
						<label>Description</label>
						<textarea
							value={template.description}
							onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
							placeholder="Optional description of this workout template..."
							maxLength={500}
							rows={3}
						/>
					</div>
				</div>
				
				<div className="template-exercises-section">
					<h3>
						Exercises ({template.exercises.length})
						{template.exercises.length > 0 && (
							<span className="category-suggestion">Category: {template.category}</span>
						)}
					</h3>
					
					{template.exercises.length === 0 ? (
						<div className="empty-exercises">
							<p>No exercises added yet. Add exercises from the library below.</p>
						</div>
					) : (
						<div className="template-exercises-list">
							{template.exercises.map((exercise, index) => (
								<div key={exercise.exerciseId} className="template-exercise-item">
									<div className="exercise-header">
										<div className="exercise-info">
											<span className="exercise-number">{index + 1}</span>
											<div>
												<h4>{exercise.exerciseName}</h4>
												<small>{exercise.muscleGroup} • {exercise.difficulty}</small>
											</div>
										</div>
										
										<div className="exercise-actions">
											<button
												onClick={() => moveExercise(index, 'up')}
												disabled={index === 0}
												className="btn-icon"
												title="Move up"
											>
												↑
											</button>
											<button
												onClick={() => moveExercise(index, 'down')}
												disabled={index === template.exercises.length - 1}
												className="btn-icon"
												title="Move down"
											>
												↓
											</button>
											<button
												onClick={() => removeExerciseFromTemplate(exercise.exerciseId)}
												className="btn-icon btn-remove"
												title="Remove exercise"
											>
												✕
											</button>
										</div>
									</div>
									
									<div className="exercise-settings">
										<div className="setting-group">
											<label>Sets</label>
											<input
												type="number"
												min="1"
												max="10"
												value={exercise.targetSets}
												onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'targetSets', parseInt(e.target.value))}
											/>
										</div>
										
										<div className="setting-group">
											<label>Reps</label>
											<input
												type="text"
												value={exercise.targetReps}
												onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'targetReps', e.target.value)}
												placeholder="e.g., 10 or 8-12"
											/>
										</div>
										
										<div className="setting-group">
											<label>Weight (kg)</label>
											<input
												type="number"
												min="0"
												step="0.5"
												value={exercise.targetWeight}
												onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'targetWeight', parseFloat(e.target.value))}
											/>
										</div>
										
										<div className="setting-group">
											<label>Rest (sec)</label>
											<input
												type="number"
												min="0"
												max="600"
												value={exercise.restTime}
												onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'restTime', parseInt(e.target.value))}
											/>
										</div>
										
										<div className="setting-group">
											<label>Exercise Rest (sec)</label>
											<input
												type="number"
												min="0"
												max="600"
												value={exercise.exerciseRestTime}
												onChange={(e) => updateExerciseInTemplate(exercise.exerciseId, 'exerciseRestTime', parseInt(e.target.value))}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				
				<div className="exercise-library-section">
					<h3>Add Exercises</h3>
					
					<div className="exercise-filters">
						<input
							type="text"
							placeholder="Search exercises..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="search-input"
						/>
						
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="category-filter"
						>
							<option value="all">All Muscle Groups</option>
							{muscleGroups.map(group => (
								<option key={group} value={group}>{group}</option>
							))}
						</select>
					</div>
					
					<div className="exercise-library-grid">
						{filteredExercises.map(exercise => {
							const isAdded = selectedExercises.includes(exercise.id);
							const isExpanded = expandedExerciseDetails.has(exercise.id);
							return (
								<div
									key={exercise.id}
									className={`exercise-library-item ${isAdded ? 'added' : ''} ${isExpanded ? 'expanded' : ''}`}
								>
									<div className="exercise-item-header">
										<div className="exercise-item-content">
											<h4>{exercise.name}</h4>
											<div className="exercise-meta">
												<span>{exercise.muscleGroup}</span>
												<span>•</span>
												<span>{exercise.difficulty}</span>
												<span>•</span>
												<span>{exercise.equipment}</span>
											</div>
										</div>
										
										<div className="exercise-item-actions">
											<button 
												className="btn-icon view-details-btn"
												onClick={() => toggleExerciseDetails(exercise.id)}
												title="View exercise details"
											>
												{isExpanded ? '▼' : '▶'}
											</button>
											{!isAdded ? (
												<button 
													className="btn btn-small btn-primary"
													onClick={() => addExerciseToTemplate(exercise)}
												>
													+ Add
												</button>
											) : (
												<span className="added-indicator">✓ Added</span>
											)}
										</div>
									</div>
									
									{isExpanded && (
										<div className="exercise-item-details">
											{exercise.video ? (
												<video className="exercise-preview-video" controls preload="metadata">
													<source src={exercise.video} type="video/mp4" />
													Your browser does not support the video tag.
												</video>
											) : (
												<div className="no-video-placeholder">
													No video available
												</div>
											)}
											
											{exercise.instructions && exercise.instructions.length > 0 && (
												<div className="exercise-instructions">
													<h5>Instructions:</h5>
													<ol>
														{exercise.instructions.map((instruction, idx) => (
															<li key={idx}>{instruction}</li>
														))}
													</ol>
												</div>
											)}
											
											<div className="exercise-additional-info">
												<div className="info-row">
													<span className="info-label">Equipment:</span>
													<span className="info-value">{exercise.equipment}</span>
												</div>
												<div className="info-row">
													<span className="info-label">Difficulty:</span>
													<span className="info-value">{exercise.difficulty}</span>
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
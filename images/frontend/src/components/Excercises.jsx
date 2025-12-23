import React, { useEffect, useState } from "react";
import "../App.css";
import exercisesData from "./gym_exercises.json";
import Filter from "./Filter";
import WorkoutTemplateBuilder from "./WorkoutTemplateBuilder";
import trackEvent from "../utils/trackEvent";

export default function Exercises({ onStartWorkout, onViewProfile, onViewHistory, onCreateTemplate, onEditTemplate }) {
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
	

// Load exercises and user data
	useEffect(() => {
		setExercises(exercisesData);
		fetchTemplates();
		fetchPersonalRecords();
		setLoading(false);
	}, []);
	
	const fetchTemplates = async () => {
		try {
			const response = await fetch('http://localhost:5000/api/workouts/templates', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				setTemplates(data.templates || []);
			}
		} catch (error) {
			console.error('Error fetching templates:', error);
		}
	};
	
	const fetchPersonalRecords = async () => {
		try {
			const response = await fetch('http://localhost:5000/api/workouts/records', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				const recordsMap = {};
				data.records.forEach(record => {
					recordsMap[record.exerciseId] = record;
				});
				setPersonalRecords(recordsMap);
			}
		} catch (error) {
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
			const token = localStorage.getItem('token');
			const isEditing = editingTemplate && editingTemplate._id;
			const url = isEditing 
				? `http://localhost:5000/api/workouts/template/${editingTemplate._id}`
				: 'http://localhost:5000/api/workouts/template';
			const method = isEditing ? 'PUT' : 'POST';
			
			const response = await fetch(url, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(templateData)
			});
			
			if (response.ok) {
				const result = await response.json();
				if (isEditing) {
					setTemplates(prev => prev.map(t => t._id === editingTemplate._id ? result.template : t));
					alert('Template updated successfully!');
				} else {
					setTemplates(prev => [...prev, result.template]);
					alert('Template created successfully!');
				}
				setShowTemplateBuilder(false);
				setEditingTemplate(null);
			} else {
				const error = await response.json();
				alert(`Failed to ${isEditing ? 'update' : 'create'} template: ` + (error.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Error saving template:', error);
			alert(`Failed to ${editingTemplate ? 'update' : 'create'} template. Please try again.`);
		}
	};

	// Handle template deletion
	const handleDeleteTemplate = async (templateId) => {
		if (!window.confirm('Are you sure you want to delete this template?')) {
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:5000/api/workouts/template/${templateId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			
			if (response.ok) {
				setTemplates(prev => prev.filter(t => t._id !== templateId));
				alert('Template deleted successfully!');
			} else {
				const error = await response.json();
				alert('Failed to delete template: ' + (error.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Error deleting template:', error);
			alert('Failed to delete template. Please try again.');
		}
	};

	// Handle starting workout from template
	const handleStartWorkoutFromTemplate = async (template) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:5000/api/workouts/session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					workoutTemplateId: template._id
				})
			});

			if (response.ok) {
				const session = await response.json();
				// Navigate to workout session (assuming this is handled by parent component)
				if (onStartWorkout) {
					onStartWorkout(session);
				}
			} else {
				const error = await response.json();
				alert('Failed to start workout: ' + (error.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Error starting workout:', error);
			alert('Failed to start workout. Please try again.');
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
												if (newExpanded.has(ex.id)) {
													newExpanded.delete(ex.id);
												} else {
													newExpanded.add(ex.id);
												}
												setExpandedInstructions(newExpanded);
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
												alert('Failed to start workout. Please try again.');
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
																console.error('Error starting workout from template:', error);
																alert('Failed to start workout from template. Please try again.');
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

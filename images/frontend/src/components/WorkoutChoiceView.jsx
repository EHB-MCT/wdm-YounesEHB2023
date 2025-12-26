import React from "react";

export default function WorkoutChoiceView({ onPremadeWorkout, onCustomWorkout, premadeWorkouts, onBack }) {
	return (
		<div className="workout-choice-container">
			<div className="workout-choice-header">
				<button onClick={onBack} className="back-button">
					⬅️ Back
				</button>
				<div className="choice-title">
					<h1>🏋️ Choose Your Workout</h1>
					<p>Select how you want to start your fitness session</p>
				</div>
			</div>

			<div className="workout-options">
				<div className="option-section">
					<div className="option-header">
						<h2>🚀 Quick Start Workouts</h2>
						<p>Professionally designed workouts for different fitness goals</p>
					</div>
					
					<div className="premade-grid">
						{premadeWorkouts.map((workout, index) => (
							<div key={index} className="premade-card">
								<div className="card-content">
									<h3>{workout.name}</h3>
									<div className="workout-stats">
										<span className="stat">
											<span className="stat-icon">💪</span>
											{workout.exercises.length} exercises
										</span>
										<span className="stat">
											<span className="stat-icon">⏱️</span>
											{workout.estimatedTime} minutes
										</span>
										<span className="stat">
											<span className="stat-icon">🔥</span>
											{workout.sets} sets
										</span>
									</div>
									
									<div className="exercise-list">
										<h4>Exercises:</h4>
										<div className="exercise-tags">
											{workout.exercises.map((exName, idx) => (
												<span key={idx} className="exercise-tag">{exName}</span>
											))}
										</div>
									</div>
									
									<div className="card-actions">
										<button 
											onClick={() => onPremadeWorkout(workout)}
											className="btn btn-primary btn-block"
										>
											Start This Workout
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="option-section">
					<div className="option-header">
						<h2>🎯 Custom Workout</h2>
						<p>Build your own workout by selecting exercises from our library</p>
					</div>
					
					<div className="custom-workout-card">
						<div className="custom-content">
							<div className="custom-icon">🏋️‍♂️</div>
							<h3>Build Your Own Workout</h3>
							<p>Choose from our extensive exercise library to create a personalized workout that matches your specific goals, equipment, and fitness level.</p>
							
							<div className="custom-features">
								<div className="feature">
									<span className="feature-icon">📚</span>
									<span>200+ Exercises</span>
								</div>
								<div className="feature">
									<span className="feature-icon">🎛️</span>
									<span>Customizable Sets/Reps</span>
								</div>
								<div className="feature">
									<span className="feature-icon">🏷️</span>
									<span>Save as Template</span>
								</div>
								<div className="feature">
									<span className="feature-icon">📊</span>
									<span>Track Progress</span>
								</div>
							</div>
							
							<div className="card-actions">
								<button 
									onClick={onCustomWorkout}
									className="btn btn-secondary btn-large btn-block"
								>
									Create Custom Workout
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="helpful-tips">
				<h3>💡 Helpful Tips</h3>
				<div className="tips-grid">
					<div className="tip">
						<h4>New to Fitness?</h4>
						<p>Start with Quick Start workouts designed for beginners to build a solid foundation.</p>
					</div>
					
					<div className="tip">
						<h4>Specific Goals?</h4>
						<p>Choose premade workouts that target your specific fitness goals (strength, cardio, etc.).</p>
					</div>
					
					<div className="tip">
						<h4>Limited Equipment?</h4>
						<p>Use the filter to find exercises that match your available equipment.</p>
					</div>
					
					<div className="tip">
						<h4>Short on Time?</h4>
						<p>Quick workouts can be completed in 15-20 minutes for effective training.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
import React from "react";

export default function ExerciseDetailView({ exercise, onBack, onAddToWorkout, isSelected }) {
	return (
		<div className="exercise-detail-container">
			<div className="exercise-detail-header">
				<button onClick={onBack} className="back-button">
					⬅️ Back to Exercises
				</button>
				<h1>{exercise.name}</h1>
				<button 
					onClick={() => onAddToWorkout(exercise)}
					className={`add-button ${isSelected ? 'added' : ''}`}
					disabled={isSelected}
				>
					{isSelected ? '✓ Added' : '+ Add to Workout'}
				</button>
			</div>

			<div className="exercise-detail-content">
				<div className="exercise-main-info">
					{exercise.video && (
						<div className="video-container">
							<video controls className="exercise-video-large" preload="metadata">
								<source src={exercise.video} type="video/mp4" />
								Your browser does not support the video tag.
							</video>
						</div>
					)}

					<div className="exercise-info-cards">
						<div className="info-card">
							<h3>🏋️ Muscle Group</h3>
							<p>{exercise.muscleGroup}</p>
						</div>
						
						<div className="info-card">
							<h3>🔧 Equipment</h3>
							<p>{exercise.equipment}</p>
						</div>
						
						<div className="info-card">
							<h3>📈 Difficulty</h3>
							<p>
								<span className={`difficulty-badge difficulty-${exercise.difficulty.toLowerCase()}`}>
									{exercise.difficulty}
								</span>
							</p>
						</div>
					</div>
				</div>

				<div className="exercise-instructions-detail">
					<h2>📋 Exercise Instructions</h2>
					{exercise.instructions && exercise.instructions.length > 0 ? (
						<ol className="instructions-list">
							{exercise.instructions.map((instruction, index) => (
								<li key={index} className="instruction-item">
									<span className="instruction-number">{index + 1}</span>
									<span className="instruction-text">{instruction}</span>
								</li>
							))}
						</ol>
					) : (
						<p className="no-instructions">No detailed instructions available for this exercise.</p>
					)}
				</div>

				<div className="exercise-tips">
					<h2>💡 Pro Tips</h2>
					<div className="tips-grid">
						<div className="tip-card">
							<h3>Form First</h3>
							<p>Focus on proper form before increasing weight. Poor form can lead to injury and reduced effectiveness.</p>
						</div>
						
						<div className="tip-card">
							<h3>Breathing</h3>
							<p>Exhale during exertion (the hardest part of the movement) and inhale during the easier phase.</p>
						</div>
						
						<div className="tip-card">
							<h3>Progressive Overload</h3>
							<p>Gradually increase weight, reps, or sets over time to continue making progress and avoid plateaus.</p>
						</div>
						
						<div className="tip-card">
							<h3>Rest Periods</h3>
							<p>Take adequate rest between sets (60-90 seconds for most exercises) to allow for proper recovery.</p>
						</div>
					</div>
				</div>

				<div className="exercise-variations">
					<h2>🔄 Variations</h2>
					<div className="variations-grid">
						<div className="variation-card">
							<h3>Easier Variation</h3>
							<p>Reduce weight or modify movement to focus on form and build confidence.</p>
						</div>
						
						<div className="variation-card">
							<h3>Standard Variation</h3>
							<p>Perform the exercise as described with proper form and appropriate weight.</p>
						</div>
						
						<div className="variation-card">
							<h3>Advanced Variation</h3>
							<p>Increase weight, add pause reps, or modify tempo for increased challenge.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
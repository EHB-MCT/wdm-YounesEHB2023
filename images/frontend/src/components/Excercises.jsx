import React, { useEffect, useState } from "react";
import "../App.css";
import exercisesData from "./gym_exercises.json";
import Filter from "./Filter";
import trackEvent, { trackExerciseHover, trackTimeToClick, trackExerciseSelect } from "../utils/trackEvent";

export default function Exercises() {
	const [exercises, setExercises] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		muscleGroup: "",
		equipment: "",
		difficulty: "",
	});
	const [exerciseHoverTimers, setExerciseHoverTimers] = useState({});
	const [pageLoadTime] = useState(new Date().getTime());

	// Load exercises
	useEffect(() => {
		setExercises(exercisesData);
		setLoading(false);
	}, []);

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

	// Track clicks with enhanced data
	const handleExerciseClick = (exercise) => {
		const timeOnPage = (new Date().getTime() - pageLoadTime) / 1000; // in seconds
		
		trackEvent("exercise_click", {
			id: exercise.id,
			name: exercise.name,
			muscleGroup: exercise.muscleGroup,
			equipment: exercise.equipment,
			difficulty: exercise.difficulty,
		});
		
		trackTimeToClick(exercise.id, timeOnPage);
		trackExerciseSelect(exercise.id, 'view_details');
	};

	// Add exercise to workout (for when workout functionality is added)
	const handleAddToWorkout = (exercise) => {
		trackExerciseSelect(exercise.id, 'added_to_workout');
	};

	// Track hover events
	const handleExerciseHover = (exerciseId, isEntering) => {
		if (isEntering) {
			// Start hover timer
			const startTime = new Date().getTime();
			setExerciseHoverTimers(prev => ({
				...prev,
				[exerciseId]: startTime
			}));
		} else {
			// End hover and track duration
			const startTime = exerciseHoverTimers[exerciseId];
			if (startTime) {
				const endTime = new Date().getTime();
				const hoverDuration = (endTime - startTime) / 1000; // in seconds
				trackExerciseHover(exerciseId, hoverDuration);
				
				// Clean up timer
				setExerciseHoverTimers(prev => {
					const newTimers = { ...prev };
					delete newTimers[exerciseId];
					return newTimers;
				});
			}
		}
	};

	return (
		<div className="exercise-container">
			<h2 className="exercise-title">Gym Exercises</h2>

			{/* Filters */}
			<Filter
				filters={filters}
				setFilters={setFilters}
				allExercises={exercises}
			/>

			{/* Exercise grid */}
			<div className="exercise-grid">
				{filteredExercises.length > 0 ? (
					filteredExercises.map((ex) => (
						<div
							key={ex.id}
							className="exercise-card"
							onClick={() => handleExerciseClick(ex)}
							onMouseEnter={() => handleExerciseHover(ex.id, true)}
							onMouseLeave={() => handleExerciseHover(ex.id, false)}
						>
							<h3 className="exercise-name">{ex.name || "Unknown Name"}</h3>

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

							<div className="exercise-description">
								<ol>
									{ex.instructions.map((instruction, idx) => (
										<li key={idx}>{instruction}</li>
									))}
								</ol>
							</div>

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
					))
				) : (
					<p className="no-results">No exercises found.</p>
				)}
			</div>
		</div>
	);
}

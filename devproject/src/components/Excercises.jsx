import React, { useEffect, useState } from "react";
import "../App.css";
import exercisesData from "./gym_exercises.json";
import Filter from "./Filter";
import trackEvent from "../utils/trackEvent";

export default function Exercises() {
	const [exercises, setExercises] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		muscleGroup: "",
		equipment: "",
		difficulty: "",
	});

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

	// Track clicks
	const handleExerciseClick = (exercise) => {
		trackEvent("exercise_view", {
			id: exercise.id,
			name: exercise.name,
			muscleGroup: exercise.muscleGroup,
			equipment: exercise.equipment,
			difficulty: exercise.difficulty,
		});
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

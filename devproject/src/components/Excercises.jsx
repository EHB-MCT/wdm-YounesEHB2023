import React, { useEffect, useState } from "react";
import "../App.css";
import exercisesData from "./gym_exercises.json";

export default function Exercises() {
	const [exercises, setExercises] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load exercises data
		setExercises(exercisesData);
		setLoading(false);
	}, []);

	if (loading) return <p className="loading-text">Oefeningen laden...</p>;

	return (
		<div className="exercise-container">
			<h2 className="exercise-title">Fitness oefeningen</h2>
			<div className="exercise-grid">
				{exercises.map((ex) => (
					<div key={ex.id} className="exercise-card">
						<h3 className="exercise-name">{ex.name || "Naam onbekend"}</h3>

						{ex.video ? (
							<video className="exercise-video" controls preload="metadata">
								<source src={ex.video} type="video/mp4" />
								Your browser does not support the video tag.
							</video>
						) : (
							<div className="exercise-image placeholder">
								Geen video beschikbaar
							</div>
						)}

						{ex.instructions && ex.instructions.length > 0 ? (
							<div className="exercise-description">
								<ol>
									{ex.instructions.map((instruction, idx) => (
										<li key={idx}>{instruction}</li>
									))}
								</ol>
							</div>
						) : (
							<p className="exercise-description italic">
								Geen beschrijving beschikbaar.
							</p>
						)}

						<p className="exercise-info">
							<strong>Spiergroep:</strong> {ex.muscleGroup || "Geen informatie"}
						</p>

						<p className="exercise-info">
							<strong>Apparatuur:</strong> {ex.equipment || "Geen"}
						</p>

						<p className="exercise-info">
							<strong>Moeilijkheid:</strong>{" "}
							<span className={`difficulty-${ex.difficulty?.toLowerCase()}`}>
								{ex.difficulty || "Onbekend"}
							</span>
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

import React, { useEffect, useState } from "react";
import "../App.css"; // Zorg dat dit pad klopt!

export default function WgerExercises() {
	const [exercises, setExercises] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchExercises() {
			try {
				const resNL = await fetch(
					"https://wger.de/api/v2/exerciseinfo/?language=2&limit=100"
				);
				const dataNL = await resNL.json();

				const resEN = await fetch(
					"https://wger.de/api/v2/exerciseinfo/?language=1&limit=100"
				);
				const dataEN = await resEN.json();

				const merged = dataNL.results.map((nl) => {
					const en = dataEN.results.find((ex) => ex.id === nl.id);

					return {
						id: nl.id,
						name: nl.name && nl.name.trim() !== "" ? nl.name : en?.name,
						description:
							nl.description && nl.description.trim() !== ""
								? nl.description
								: en?.description,
						muscles: nl.muscles.length > 0 ? nl.muscles : en?.muscles || [],
						equipment:
							nl.equipment.length > 0 ? nl.equipment : en?.equipment || [],
						images: nl.images.length > 0 ? nl.images : en?.images || [],
					};
				});

				const filtered = merged.filter(
					(ex) =>
						(ex.description && ex.description.trim() !== "") ||
						(ex.images && ex.images.length > 0)
				);

				setExercises(filtered);
			} catch (err) {
				console.error("Fout bij ophalen:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchExercises();
	}, []);

	if (loading) return <p className="loading-text">Oefeningen laden...</p>;

	return (
		<div className="exercise-container">
			<h2 className="exercise-title">Wger oefeningen</h2>
			<div className="exercise-grid">
				{exercises.map((ex) => (
					<div key={ex.id} className="exercise-card">
						<h3 className="exercise-name">{ex.name || "Naam onbekend"}</h3>

						{ex.images && ex.images.length > 0 ? (
							<img
								src={ex.images[0].image}
								alt={ex.name}
								className="exercise-image"
							/>
						) : (
							<div className="exercise-image placeholder">
								Geen afbeelding beschikbaar
							</div>
						)}

						{ex.description && ex.description.trim() !== "" ? (
							<p
								className="exercise-description"
								dangerouslySetInnerHTML={{ __html: ex.description }}
							/>
						) : (
							<p className="exercise-description italic">
								Geen beschrijving beschikbaar.
							</p>
						)}

						<p className="exercise-info">
							<strong>Spieren:</strong>{" "}
							{ex.muscles && ex.muscles.length > 0
								? ex.muscles.map((m) => m.name).join(", ")
								: "Geen informatie"}
						</p>

						<p className="exercise-info">
							<strong>Apparatuur:</strong>{" "}
							{ex.equipment && ex.equipment.length > 0
								? ex.equipment.map((eq) => eq.name).join(", ")
								: "Geen"}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

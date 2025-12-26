import React from "react";
import trackEvent from "../utils/trackEvent";

export default function Filter({ filters, setFilters, exercises }) {
	// Safety check to prevent undefined errors
	const exerciseList = exercises || [];
	
	const uniqueMuscleGroups = [
		...new Set(exerciseList.map((ex) => ex.muscleGroup)),
	];
	const uniqueEquipments = [
		...new Set(exerciseList.flatMap((ex) => ex.equipment.split(", "))),
	];
	const uniqueDifficulties = [
		...new Set(exerciseList.map((ex) => ex.difficulty)),
	];

	const handleFilterChange = (e) => {
		const { name, value } = e.target;

		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));

		//  Track filter usage
		trackEvent("filter_change", {
			filterName: name,
			value: value,
		});
	};

	const resetFilters = () => {
		setFilters({
			muscleGroup: "",
			equipment: "",
			difficulty: "",
		});

		trackEvent("filter_reset", {});
	};

	return (
		<div className="filter-container">
			<h3>Filter Exercises</h3>

			<div className="filter-group">
				<label>Muscle Group:</label>
				<select
					name="muscleGroup"
					value={filters.muscleGroup}
					onChange={handleFilterChange}
				>
					<option value="">All</option>
					{uniqueMuscleGroups.map((group) => (
						<option key={group} value={group}>
							{group}
						</option>
					))}
				</select>
			</div>

			<div className="filter-group">
				<label>Equipment:</label>
				<select
					name="equipment"
					value={filters.equipment}
					onChange={handleFilterChange}
				>
					<option value="">All</option>
					{uniqueEquipments.map((eq) => (
						<option key={eq} value={eq}>
							{eq}
						</option>
					))}
				</select>
			</div>

			<div className="filter-group">
				<label>Difficulty:</label>
				<select
					name="difficulty"
					value={filters.difficulty}
					onChange={handleFilterChange}
				>
					<option value="">All</option>
					{uniqueDifficulties.map((dif) => (
						<option key={dif} value={dif}>
							{dif}
						</option>
					))}
				</select>
			</div>

			<button onClick={resetFilters} className="reset-button">
				Reset Filters
			</button>
		</div>
	);
}

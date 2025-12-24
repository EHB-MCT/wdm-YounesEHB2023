import React, { useState, useEffect } from "react";
import exercisesData from "./gym_exercises.json";
import trackEvent from "../utils/trackEvent";
import { useNotifications, showWorkoutError, showWorkoutSuccess } from "../utils/notifications";
import { API_CONFIG, api } from "../utils/api.js";

// Custom styles
const customStyles = `
	.all-in-one-workout {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}
	.workout-tabs {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
		border-bottom: 2px solid #e9ecef;
	}
	.tab-btn {
		padding: 12px 20px;
		border: none;
		background: none;
		cursor: pointer;
		font-weight: 600;
		color: #6c757d;
		border-bottom: 3px solid transparent;
		transition: all 0.3s ease;
	}
	.tab-btn.active {
		color: #007bff;
		border-bottom-color: #007bff;
	}
	.tab-btn:hover {
		color: #007bff;
	}
	.tab-content {
		display: none;
		animation: fadeIn 0.3s ease;
	}
	.tab-content.active {
		display: block;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.preset-workout-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 30px;
	}
	.preset-workout-card {
		border: 2px solid #e9ecef;
		border-radius: 12px;
		padding: 20px;
		cursor: pointer;
		transition: all 0.3s ease;
		background: white;
	}
	.preset-workout-card:hover {
		border-color: #007bff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,123,255,0.15);
	}
	.preset-workout-card.selected {
		border-color: #28a745;
		background-color: #f8fff9;
	}
	.preset-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}
	.preset-title {
		font-size: 1.3em;
		font-weight: 700;
		color: #333;
		margin: 0;
	}
	.preset-meta {
		display: flex;
		gap: 10px;
		margin-bottom: 15px;
	}
	.meta-badge {
		background-color: #f8f9fa;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.85em;
		color: #6c757d;
	}
	.preset-exercises {
		margin-bottom: 15px;
	}
	.exercise-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.exercise-list li {
		padding: 5px 0;
		border-bottom: 1px solid #f1f3f4;
		font-size: 0.9em;
		color: #666;
	}
	.exercise-list li:last-child {
		border-bottom: none;
	}
	.start-workout-btn {
		width: 100%;
		padding: 12px;
		background: linear-gradient(135deg, #007bff, #0056b3);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	.start-workout-btn:hover {
		background: linear-gradient(135deg, #0056b3, #004085);
		transform: translateY(-1px);
	}
	.custom-exercise {
		border: 2px solid #007bff !important;
		background-color: #f8f9ff !important;
	}
	.custom-badge {
		background-color: #007bff;
		color: white;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		margin-left: 5px;
	}
	.custom-label {
		color: #007bff;
		font-weight: normal;
		font-size: 0.9em;
	}
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 15px;
		margin-bottom: 20px;
	}
	.exercise-tile {
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 10px;
		transition: all 0.3s ease;
	}
	.exercise-tile:hover {
		border-color: #007bff;
		box-shadow: 0 2px 8px rgba(0,123,255,0.1);
	}
	.exercise-tile.added {
		border-color: #28a745;
		background-color: #f8fff9;
	}
	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.3s ease;
	}
	.btn-primary {
		background-color: #007bff;
		color: white;
	}
	.btn-primary:hover {
		background-color: #0056b3;
	}
	.btn-secondary {
		background-color: #6c757d;
		color: white;
	}
	.btn-success {
		background-color: #28a745;
		color: white;
	}
	.btn-add {
		background-color: #28a745;
		color: white;
	}
	.btn-add:hover {
		background-color: #218838;
	}
	.form-input, .form-select {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid #ced4da;
		border-radius: 6px;
		font-size: 14px;
	}
	.form-group {
		margin-bottom: 15px;
	}
	.form-group label {
		display: block;
		margin-bottom: 5px;
		font-weight: 500;
		color: #495057;
	}
	.card {
		border: 1px solid #e9ecef;
		border-radius: 12px;
		margin-bottom: 20px;
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
	}
	.card-header {
		padding: 20px;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.card-content {
		padding: 20px;
	}
	.exercise-card {
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 15px;
		margin-bottom: 15px;
	}
	.exercise-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 10px;
	}
	.setting-input {
		width: 100%;
		padding: 6px;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 14px;
	}
	.search-box {
		position: relative;
		flex: 1;
		max-width: 300px;
	}
	.search-input {
		width: 100%;
		padding: 8px 12px 8px 35px;
		border: 1px solid #ced4da;
		border-radius: 6px;
	}
	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
	}
	.library-filters {
		display: flex;
		gap: 15px;
		margin-bottom: 20px;
		align-items: center;
	}
	.filter-select {
		padding: 8px 12px;
		border: 1px solid #ced4da;
		border-radius: 6px;
	}
	.exercise-count {
		background-color: #007bff;
		color: white;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.85em;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 15px;
	}
	.workout-header {
		margin-bottom: 30px;
	}
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.header-text h1 {
		margin: 0 0 5px 0;
		color: #333;
	}
	.header-text p {
		margin: 0;
		color: #6c757d;
	}
	.order-number {
		background-color: #007bff;
		color: white;
		border-radius: 50%;
		width: 25px;
		height: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 12px;
	}
	.exercise-info h3 {
		margin: 0 0 5px 0;
		color: #333;
	}
	.exercise-meta {
		font-size: 0.9em;
		color: #6c757d;
	}
	.separator {
		margin: 0 5px;
	}
	.setting-item label {
		display: block;
		margin-bottom: 3px;
		font-size: 0.85em;
		color: #495057;
	}
	.added-badge {
		color: #28a745;
		font-weight: bold;
	}
	.exercise-tags {
		display: flex;
		gap: 5px;
		margin: 5px 0;
	}
	.tag {
		background-color: #f8f9fa;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.8em;
		color: #6c757d;
	}
	.equipment-info {
		font-size: 0.85em;
		color: #6c757d;
		margin-top: 5px;
	}
	.exercise-tile-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.exercise-tile-content {
		flex: 1;
	}
	.exercise-tile-actions {
		margin-left: 10px;
	}
	.preset-description {
		color: #6c757d;
		font-size: 0.9em;
		margin-bottom: 15px;
	}
	.template-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}
	.template-card {
		border: 1px solid #e9ecef;
		border-radius: 12px;
		padding: 20px;
		background: white;
		transition: all 0.3s ease;
	}
	.template-card:hover {
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		transform: translateY(-2px);
	}
	.template-card.loading {
		opacity: 0.6;
		pointer-events: none;
	}
	.template-header {
		margin-bottom: 15px;
	}
	.template-info h3 {
		margin: 0 0 8px 0;
		color: #212529;
		font-size: 1.1em;
	}
	.template-meta {
		display: flex;
		gap: 8px;
		margin-bottom: 10px;
	}
	.meta-badge {
		background-color: #e9ecef;
		color: #495057;
		padding: 3px 8px;
		border-radius: 12px;
		font-size: 0.8em;
	}
	.meta-badge.category {
		background-color: #007bff;
		color: white;
	}
	.template-description {
		color: #6c757d;
		font-size: 0.9em;
		margin-bottom: 15px;
		line-height: 1.4;
	}
	.template-exercises {
		margin-bottom: 15px;
	}
	.exercise-preview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 8px;
	}
	.mini-exercise {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 8px;
		background-color: #f8f9fa;
		border-radius: 6px;
		font-size: 0.85em;
	}
	.exercise-name {
		font-weight: 500;
		color: #495057;
	}
	.exercise-details {
		color: #6c757d;
		font-weight: 600;
	}
	.more-exercises {
		text-align: center;
		color: #6c757d;
		font-style: italic;
		font-size: 0.85em;
		padding: 8px;
	}
	.template-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 15px;
	}
	.template-actions {
		display: flex;
		justify-content: flex-end;
	}
	.empty-state {
		text-align: center;
		padding: 40px;
		color: #6c757d;
	}
	.empty-icon {
		font-size: 3em;
		margin-bottom: 15px;
		opacity: 0.5;
	}
	.empty-state h3 {
		margin: 0 0 10px 0;
		color: #495057;
	}
	.empty-state p {
		margin: 0 0 20px 0;
		line-height: 1.5;
	}
	.loading-spinner {
		display: inline-block;
		padding: 10px 20px;
		background-color: #f8f9fa;
		border-radius: 8px;
		color: #6c757d;
	}
	`;

// Pre-made workout templates based on common fitness goals
const PRESET_WORKOUTS = [
	{
		id: 'beginner_full_body',
		name: 'Beginner Full Body',
		category: 'Beginner',
		duration: '30 min',
		exercises: [
			{ exerciseId: 2, exerciseName: 'Bench Press', targetSets: 3, targetReps: '10', restTime: 60 },
			{ exerciseId: 15, exerciseName: 'Squats', targetSets: 3, targetReps: '12', restTime: 60 },
			{ exerciseId: 8, exerciseName: 'Bent Over Rows', targetSets: 3, targetReps: '10', restTime: 60 },
			{ exerciseId: 25, exerciseName: 'Push-ups', targetSets: 3, targetReps: '8-12', restTime: 45 },
			{ exerciseId: 30, exerciseName: 'Plank', targetSets: 3, targetReps: '30 sec', restTime: 30 }
		],
		description: 'Perfect for beginners to build overall strength'
	},
	{
		id: 'upper_body_strength',
		name: 'Upper Body Strength',
		category: 'Strength',
		duration: '45 min',
		exercises: [
			{ exerciseId: 2, exerciseName: 'Bench Press', targetSets: 4, targetReps: '8', restTime: 90 },
			{ exerciseId: 5, exerciseName: 'Overhead Press', targetSets: 4, targetReps: '10', restTime: 60 },
			{ exerciseId: 8, exerciseName: 'Bent Over Rows', targetSets: 4, targetReps: '8', restTime: 90 },
			{ exerciseId: 1, exerciseName: 'Barbell Biceps Curl', targetSets: 3, targetReps: '12', restTime: 60 },
			{ exerciseId: 12, exerciseName: 'Tricep Dips', targetSets: 3, targetReps: '10', restTime: 60 }
		],
		description: 'Build serious upper body muscle and strength'
	},
	{
		id: 'lower_body_power',
		name: 'Lower Body Power',
		category: 'Strength',
		duration: '40 min',
		exercises: [
			{ exerciseId: 15, exerciseName: 'Squats', targetSets: 4, targetReps: '8', restTime: 120 },
			{ exerciseId: 18, exerciseName: 'Deadlifts', targetSets: 3, targetReps: '5', restTime: 180 },
			{ exerciseId: 20, exerciseName: 'Lunges', targetSets: 3, targetReps: '10 each', restTime: 60 },
			{ exerciseId: 22, exerciseName: 'Calf Raises', targetSets: 4, targetReps: '15', restTime: 45 }
		],
		description: 'Develop powerful legs and glutes'
	},
	{
		id: 'hiit_cardio',
		name: 'HIIT Cardio Blast',
		category: 'Cardio',
		duration: '20 min',
		exercises: [
			{ exerciseId: 25, exerciseName: 'Burpees', targetSets: 3, targetReps: '10', restTime: 30 },
			{ exerciseId: 28, exerciseName: 'Mountain Climbers', targetSets: 3, targetReps: '20', restTime: 30 },
			{ exerciseId: 26, exerciseName: 'Jumping Jacks', targetSets: 3, targetReps: '30', restTime: 30 },
			{ exerciseId: 27, exerciseName: 'High Knees', targetSets: 3, targetReps: '20', restTime: 30 }
		],
		description: 'High-intensity interval training for maximum calorie burn'
	},
	{
		id: 'core_focused',
		name: 'Core Focused',
		category: 'Core',
		duration: '25 min',
		exercises: [
			{ exerciseId: 30, exerciseName: 'Plank', targetSets: 3, targetReps: '60 sec', restTime: 30 },
			{ exerciseId: 31, exerciseName: 'Crunches', targetSets: 3, targetReps: '20', restTime: 30 },
			{ exerciseId: 32, exerciseName: 'Russian Twists', targetSets: 3, targetReps: '15 each', restTime: 30 },
			{ exerciseId: 33, exerciseName: 'Leg Raises', targetSets: 3, targetReps: '15', restTime: 30 }
		],
		description: 'Strengthen and sculpt your entire core'
	},
	{
		id: 'quick_lunch',
		name: 'Quick Lunch Workout',
		category: 'Quick',
		duration: '15 min',
		exercises: [
			{ exerciseId: 25, exerciseName: 'Push-ups', targetSets: 2, targetReps: '15', restTime: 30 },
			{ exerciseId: 15, exerciseName: 'Bodyweight Squats', targetSets: 2, targetReps: '20', restTime: 30 },
			{ exerciseId: 30, exerciseName: 'Plank', targetSets: 2, targetReps: '45 sec', restTime: 30 }
		],
		description: 'Perfect workout when you are short on time'
	}
];

export default function AllInOneWorkout({ onStartWorkout, onBack }) {
	const { showError, showSuccess, showWarning } = useNotifications();
	const [activeTab, setActiveTab] = useState('presets');
	const [selectedPreset, setSelectedPreset] = useState(null);
	const [selectedExercises, setSelectedExercises] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [workoutName, setWorkoutName] = useState("");
	const [isStarting, setIsStarting] = useState(false);
	const [showCustomExerciseForm, setShowCustomExerciseForm] = useState(false);
	const [customExercise, setCustomExercise] = useState({
		name: "",
		muscleGroup: "Custom",
		equipment: "Bodyweight",
		difficulty: "Beginner",
		targetSets: 3,
		targetReps: "10",
		targetWeight: 0,
		restTime: 60
	});
	const [userTemplates, setUserTemplates] = useState([]);
	const [templatesLoading, setTemplatesLoading] = useState(false);

	const muscleGroups = [...new Set(exercisesData.map(ex => ex.muscleGroup))];
	
	const filteredExercises = exercisesData.filter(exercise => {
		const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === "all" || exercise.muscleGroup === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	// Load user templates when templates tab is selected
	useEffect(() => {
		if (activeTab === 'templates') {
			fetchUserTemplates();
		}
	}, [activeTab]);

	const fetchUserTemplates = async () => {
		setTemplatesLoading(true);
		try {
			const data = await api.get(API_CONFIG.ENDPOINTS.WORKOUT_TEMPLATES);
			setUserTemplates(data.templates || []);
		} catch (error) {
			console.error('Error fetching user templates:', error);
			showError('Failed to load templates');
		} finally {
			setTemplatesLoading(false);
		}
	};

	// Inject custom styles
	useEffect(() => {
		const styleElement = document.createElement('style');
		styleElement.textContent = customStyles;
		document.head.appendChild(styleElement);
		
		return () => {
			if (document.head.contains(styleElement)) {
				document.head.removeChild(styleElement);
			}
		};
	}, []);

	const addCustomExercise = () => {
		if (!customExercise.name.trim()) {
			showError('Please enter an exercise name');
			return;
		}

		const newExercise = {
			exerciseId: `custom_${Date.now()}`,
			exerciseName: customExercise.name,
			muscleGroup: customExercise.muscleGroup,
			equipment: customExercise.equipment,
			difficulty: customExercise.difficulty,
			targetSets: customExercise.targetSets,
			targetReps: customExercise.targetReps,
			targetWeight: customExercise.targetWeight,
			restTime: customExercise.restTime,
			exerciseRestTime: 90,
			isCustom: true
		};

		setSelectedExercises(prev => [...prev, newExercise]);
		setCustomExercise({
			name: "",
			muscleGroup: "Custom",
			equipment: "Bodyweight",
			difficulty: "Beginner",
			targetSets: 3,
			targetReps: "10",
			targetWeight: 0,
			restTime: 60
		});
		setShowCustomExerciseForm(false);
	};

	const addExercise = (exercise) => {
		// Fix ID type mismatch - ensure consistent string comparison
		const isAlreadyAdded = selectedExercises.some(ex => String(ex.exerciseId) === String(exercise.id));
		
		if (isAlreadyAdded) {
			showWarning('Exercise already added to your workout!');
			return;
		}

		const newExercise = {
			exerciseId: exercise.id,
			exerciseName: exercise.name,
			muscleGroup: exercise.muscleGroup,
			targetSets: 3,
			targetReps: "10",
			targetWeight: 0,
			restTime: 60,
			equipment: exercise.equipment,
			difficulty: exercise.difficulty,
			video: exercise.video,
			instructions: exercise.instructions
		};
		
		setSelectedExercises(prev => [...prev, newExercise]);
	};

	const removeExercise = (exerciseId) => {
		setSelectedExercises(selectedExercises.filter(ex => ex.exerciseId !== exerciseId));
	};

	const updateExercise = (exerciseId, field, value) => {
		const updatedExercises = selectedExercises.map(ex => 
			ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
		);
		setSelectedExercises(updatedExercises);
	};

	const startTemplateWorkout = async (template) => {
		setIsStarting(true);
		try {
			const data = await api.post(API_CONFIG.ENDPOINTS.WORKOUT_SESSION, {
				workoutTemplateId: template._id
			});
			
			trackEvent("template_workout_started", {
				templateName: template.name,
				templateCategory: template.category,
				exerciseCount: template.exercises.length
			});
			onStartWorkout(data);
		} catch (error) {
			console.error('Error starting template workout:', error);
			showWorkoutError(error, 'template workout', showError);
		} finally {
			setIsStarting(false);
		}
	};

	const startPresetWorkout = async (preset) => {
		setIsStarting(true);
		try {
			// Create workout session with preset exercises
			const data = await api.post(API_CONFIG.ENDPOINTS.WORKOUT_SESSION, {
				templateId: null,
				templateName: preset.name,
				exercises: preset.exercises
			});

			trackEvent("preset_workout_started", {
				presetName: preset.name,
				exerciseCount: preset.exercises.length
			});
			onStartWorkout(data);
		} catch (error) {
			console.error('Error starting preset workout:', error);
			showWorkoutError(error, 'preset workout', showError);
		} finally {
			setIsStarting(false);
		}
	};

	const startCustomWorkout = async () => {
		if (selectedExercises.length === 0) {
			showWarning("Please add at least one exercise");
			return;
		}

		const workoutName = document.getElementById('custom-workout-name')?.value.trim() || "Custom Workout";
		setIsStarting(true);

		try {
			const data = await api.post(API_CONFIG.ENDPOINTS.WORKOUT_SESSION, {
				templateId: null,
				templateName: workoutName,
				exercises: selectedExercises.map(ex => ({
					exerciseId: ex.exerciseId,
					exerciseName: ex.exerciseName,
					targetSets: ex.targetSets,
					targetReps: ex.targetReps,
					targetWeight: ex.targetWeight,
					restTime: ex.restTime,
					equipment: ex.equipment,
					difficulty: ex.difficulty,
					video: ex.video,
					instructions: ex.instructions
				}))
			});

			trackEvent("custom_workout_started", {
				workoutName,
				exerciseCount: selectedExercises.length
			});
			onStartWorkout(data);
		} catch (error) {
			console.error('Error starting custom workout:', error);
			showWorkoutError(error, 'custom workout', showError);
		} finally {
			setIsStarting(false);
		}
	};

	return (
		<div className="all-in-one-workout">
			{/* Header */}
			<header className="workout-header">
				<div className="header-content">
					{onBack && (
						<button onClick={onBack} className="btn btn-secondary">
							← Back
						</button>
					)}
					<div className="header-text">
						<h1>💪 Workout Center</h1>
						<p>Choose your workout style and start training</p>
					</div>
				</div>
			</header>

			{/* Tabs */}
			<div className="workout-tabs">
				<button 
					className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
					onClick={() => setActiveTab('presets')}
				>
					🎯 Quick Workouts
				</button>
				<button 
					className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
					onClick={() => setActiveTab('custom')}
				>
					🔧 Build Custom
				</button>
				<button 
					className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
					onClick={() => setActiveTab('templates')}
				>
					📝 My Templates
				</button>
			</div>

			{/* Quick Workouts Tab */}
			<div className={`tab-content ${activeTab === 'presets' ? 'active' : ''}`}>
				<div className="card">
					<div className="card-header">
						<h2>Pre-Made Workouts</h2>
						<span className="exercise-count">{PRESET_WORKOUTS.length} workouts</span>
					</div>
					<div className="card-content">
						<div className="preset-workout-grid">
							{PRESET_WORKOUTS.map(preset => (
								<div 
									key={preset.id}
									className={`preset-workout-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
									onClick={() => setSelectedPreset(preset)}
								>
									<div className="preset-header">
										<h3 className="preset-title">{preset.name}</h3>
										<span className="meta-badge">{preset.duration}</span>
									</div>
									<div className="preset-meta">
										<span className="meta-badge">{preset.category}</span>
										<span className="meta-badge">{preset.exercises.length} exercises</span>
									</div>
									<p className="preset-description">{preset.description}</p>
									<div className="preset-exercises">
										<ul className="exercise-list">
											{preset.exercises.slice(0, 3).map((ex, idx) => (
												<li key={idx}>
													{ex.targetSets}× {ex.targetReps} {ex.exerciseName}
												</li>
											))}
											{preset.exercises.length > 3 && (
												<li>+{preset.exercises.length - 3} more exercises</li>
											)}
										</ul>
									</div>
									<button 
										className="start-workout-btn"
										onClick={(e) => {
											e.stopPropagation();
											startPresetWorkout(preset);
										}}
										disabled={isStarting}
									>
										{isStarting && selectedPreset?.id === preset.id ? 'Starting...' : 'Start Workout'}
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Custom Workout Tab */}
			<div className={`tab-content ${activeTab === 'custom' ? 'active' : ''}`}>
				{/* Custom Exercise Form */}
				{showCustomExerciseForm && (
					<div className="card">
						<div className="card-header">
							<h2>Create Custom Exercise</h2>
							<button 
								onClick={() => setShowCustomExerciseForm(false)}
								className="btn btn-secondary"
							>
								✕
							</button>
						</div>
						<div className="card-content">
							<div className="form-grid">
								<div className="form-group">
									<label>Exercise Name *</label>
									<input
										type="text"
										value={customExercise.name}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
										placeholder="e.g., My Custom Push-up"
										className="form-input"
									/>
								</div>
								<div className="form-group">
									<label>Muscle Group</label>
									<select
										value={customExercise.muscleGroup}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, muscleGroup: e.target.value }))}
										className="form-select"
									>
										<option value="Custom">Custom</option>
										<option value="Chest">Chest</option>
										<option value="Back">Back</option>
										<option value="Shoulders">Shoulders</option>
										<option value="Arms">Arms</option>
										<option value="Legs">Legs</option>
										<option value="Glutes">Glutes</option>
										<option value="Core">Core</option>
									</select>
								</div>
								<div className="form-group">
									<label>Equipment</label>
									<select
										value={customExercise.equipment}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, equipment: e.target.value }))}
										className="form-select"
									>
										<option value="Bodyweight">Bodyweight</option>
										<option value="Dumbbells">Dumbbells</option>
										<option value="Barbell">Barbell</option>
										<option value="Kettlebells">Kettlebells</option>
										<option value="Resistance Bands">Resistance Bands</option>
									</select>
								</div>
								<div className="form-group">
									<label>Difficulty</label>
									<select
										value={customExercise.difficulty}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, difficulty: e.target.value }))}
										className="form-select"
									>
										<option value="Beginner">Beginner</option>
										<option value="Intermediate">Intermediate</option>
										<option value="Advanced">Advanced</option>
									</select>
								</div>
								<div className="form-group">
									<label>Sets</label>
									<input
										type="number"
										min="1"
										max="10"
										value={customExercise.targetSets}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, targetSets: parseInt(e.target.value) }))}
										className="form-input"
									/>
								</div>
								<div className="form-group">
									<label>Reps</label>
									<input
										type="text"
										value={customExercise.targetReps}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, targetReps: e.target.value }))}
										placeholder="e.g., 10 or 8-12"
										className="form-input"
									/>
								</div>
								<div className="form-group">
									<label>Weight (kg)</label>
									<input
										type="number"
										min="0"
										step="0.5"
										value={customExercise.targetWeight}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) }))}
										className="form-input"
									/>
								</div>
								<div className="form-group">
									<label>Rest (sec)</label>
									<input
										type="number"
										min="0"
										max="600"
										value={customExercise.restTime}
										onChange={(e) => setCustomExercise(prev => ({ ...prev, restTime: parseInt(e.target.value) }))}
										className="form-input"
									/>
								</div>
							</div>
							<div style={{ display: 'flex', gap: '10px' }}>
								<button 
									onClick={() => setShowCustomExerciseForm(false)}
									className="btn btn-secondary"
								>
									Cancel
								</button>
								<button 
									onClick={addCustomExercise}
									className="btn btn-success"
								>
									Add Custom Exercise
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Selected Exercises */}
				{selectedExercises.length > 0 && (
					<div className="card">
						<div className="card-header">
							<h2>Your Custom Workout</h2>
							<span className="exercise-count">{selectedExercises.length} exercises</span>
						</div>
						<div className="card-content">
							<div className="form-group">
								<label>Workout Name</label>
								<input
									id="custom-workout-name"
									type="text"
									value={workoutName}
									onChange={(e) => setWorkoutName(e.target.value)}
									placeholder="e.g., My Custom Workout"
									className="form-input"
								/>
							</div>
							
							{selectedExercises.map((exercise, index) => (
								<div key={exercise.exerciseId} className={`exercise-card ${exercise.isCustom ? 'custom-exercise' : ''}`}>
									<div className="exercise-card-header">
										<div className="exercise-order">
											<span className="order-number">{index + 1}</span>
											{exercise.isCustom && <span className="custom-badge">👤</span>}
										</div>
										<div className="exercise-info">
											<h3>
												{exercise.exerciseName}
												{exercise.isCustom && <span className="custom-label"> (Custom)</span>}
											</h3>
											<div className="exercise-meta">
												<span className="muscle-group">{exercise.muscleGroup}</span>
												<span className="separator">•</span>
												<span className="difficulty">{exercise.difficulty}</span>
											</div>
										</div>
										<button
											onClick={() => removeExercise(exercise.exerciseId)}
											className="btn btn-secondary"
										>
											✕
										</button>
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
													onChange={(e) => updateExercise(exercise.exerciseId, 'targetSets', parseInt(e.target.value))}
													className="setting-input"
												/>
											</div>
											<div className="setting-item">
												<label>Reps</label>
												<input
													type="text"
													value={exercise.targetReps}
													onChange={(e) => updateExercise(exercise.exerciseId, 'targetReps', e.target.value)}
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
													onChange={(e) => updateExercise(exercise.exerciseId, 'targetWeight', parseFloat(e.target.value))}
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
													onChange={(e) => updateExercise(exercise.exerciseId, 'restTime', parseInt(e.target.value))}
													className="setting-input"
												/>
											</div>
										</div>
									</div>
								</div>
							))}
							
							<button 
								onClick={startCustomWorkout}
								disabled={selectedExercises.length === 0 || isStarting}
								className="start-workout-btn"
								style={{ marginTop: '20px' }}
							>
								{isStarting ? "Starting..." : "Start Custom Workout"}
							</button>
						</div>
					</div>
				)}

				{/* Exercise Library */}
				<div className="card">
					<div className="card-header">
						<div className="header-left">
							<h2>Exercise Library</h2>
							<div className="library-stats">
								{filteredExercises.length} exercises found
							</div>
						</div>
						<button 
							onClick={() => setShowCustomExerciseForm(true)}
							className="btn btn-success"
						>
							➕ Create Custom Exercise
						</button>
					</div>
					
					<div className="library-filters">
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
						
						<div className="search-box">
							<input
								type="text"
								placeholder="Search exercises..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="search-input"
							/>
							<div className="search-icon">🔍</div>
						</div>
					</div>
					
					<div className="exercise-grid">
						{filteredExercises.map(exercise => {
							const isAdded = selectedExercises.some(ex => String(ex.exerciseId) === String(exercise.id));
							return (
								<div
									key={exercise.id}
									className={`exercise-tile ${isAdded ? 'added' : ''}`}
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
											{!isAdded ? (
												<button 
													className="btn btn-add"
													onClick={() => addExercise(exercise)}
												>
													+ Add
												</button>
											) : (
												<span className="added-badge">✓ Added</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* My Templates Tab */}
			<div className={`tab-content ${activeTab === 'templates' ? 'active' : ''}`}>
				<div className="card">
					<div className="card-header">
						<div className="header-left">
							<h2>My Workout Templates</h2>
							<span className="exercise-count">{userTemplates.length} templates</span>
						</div>
						<button 
							onClick={fetchUserTemplates}
							className="btn btn-secondary btn-small"
							disabled={templatesLoading}
						>
							{templatesLoading ? 'Loading...' : '🔄 Refresh'}
						</button>
					</div>
					
					<div className="card-content">
						{templatesLoading ? (
							<div style={{ textAlign: 'center', padding: '40px' }}>
								<div className="loading-spinner">Loading templates...</div>
							</div>
						) : userTemplates.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">📝</div>
								<h3>No templates yet</h3>
								<p>Create your first workout template from the "Build Custom" tab to save your favorite workout combinations!</p>
								<button 
									onClick={() => setActiveTab('custom')}
									className="btn btn-primary"
								>
									Create First Template
								</button>
							</div>
						) : (
							<div className="template-grid">
								{userTemplates.map(template => (
									<div 
										key={template._id}
										className={`template-card ${isStarting ? 'loading' : ''}`}
									>
										<div className="template-header">
											<div className="template-info">
												<h3>{template.name}</h3>
												<div className="template-meta">
													<span className="meta-badge category">{template.category}</span>
													<span className="meta-badge">{template.exercises.length} exercises</span>
												</div>
											</div>
										</div>
										
										{template.description && (
											<p className="template-description">{template.description}</p>
										)}
										
										<div className="template-exercises">
											<div className="exercise-preview">
												{template.exercises.slice(0, 3).map((ex, idx) => (
													<div key={idx} className="mini-exercise">
														<span className="exercise-name">{ex.exerciseName}</span>
														<span className="exercise-details">{ex.targetSets}× {ex.targetReps}</span>
													</div>
												))}
												{template.exercises.length > 3 && (
													<div className="more-exercises">
														+{template.exercises.length - 3} more exercises
													</div>
												)}
											</div>
										</div>
										
										<div className="template-tags">
											{template.tags && template.tags.map((tag, idx) => (
												<span key={idx} className="tag">{tag}</span>
											))}
										</div>
										
										<div className="template-actions">
											<button 
												onClick={() => startTemplateWorkout(template)}
												className="btn btn-primary"
												disabled={isStarting}
											>
												{isStarting ? 'Starting...' : '🏃 Start Workout'}
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
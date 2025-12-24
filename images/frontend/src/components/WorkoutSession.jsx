import React, { useState, useEffect, useRef } from "react";
import trackEvent, { trackWorkoutSession, trackExerciseComplete } from "../utils/trackEvent";
import { useNotifications, showWorkoutError, showWorkoutSuccess } from "../utils/notifications";
import { API_CONFIG, api } from "../utils/api.js";

export default function WorkoutSession({ session, onSessionUpdate, onComplete, onAbandon, onBack }) {
	const { showError, showSuccess, showWarning } = useNotifications();
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSet, setCurrentSet] = useState(1);
	const [isResting, setIsResting] = useState(false);
	const [restTimeLeft, setRestTimeLeft] = useState(0);
	const [weightUnit, setWeightUnit] = useState('kg');
	const [showPRNotification, setShowPRNotification] = useState(false);
	const [prData, setPrData] = useState(null);
	const [sessionStartTime] = useState(new Date());
	const restTimerRef = useRef(null);
	
	const currentExercise = session?.exercises?.[currentExerciseIndex];
	const isLastExercise = currentExerciseIndex === session?.exercises?.length - 1;
	const isFirstExercise = currentExerciseIndex === 0;
	
	useEffect(() => {
		const savedUnit = localStorage.getItem('weightUnit');
		if (savedUnit) {
			setWeightUnit(savedUnit);
		}
	}, []);
	
	useEffect(() => {
		localStorage.setItem('weightUnit', weightUnit);
	}, [weightUnit]);
	
	useEffect(() => {
		if (isResting && restTimeLeft > 0) {
			restTimerRef.current = setTimeout(() => {
				setRestTimeLeft(prev => prev - 1);
			}, 1000);
		} else if (isResting && restTimeLeft === 0) {
			setIsResting(false);
			playNotificationSound();
		}
		
		return () => {
			if (restTimerRef.current) {
				clearTimeout(restTimerRef.current);
			}
		};
	}, [isResting, restTimeLeft]);
	
	const playNotificationSound = () => {
		// Create a simple beep sound using Web Audio API
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		
		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);
		
		oscillator.frequency.value = 800;
		oscillator.type = 'sine';
		
		gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
		
		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.5);
	};
	
	const startRestTimer = (duration) => {
		setIsResting(true);
		setRestTimeLeft(duration);
	};
	
	const skipRestTimer = () => {
		setIsResting(false);
		setRestTimeLeft(0);
		if (restTimerRef.current) {
			clearTimeout(restTimerRef.current);
		}
	};
	
	const logSet = async (reps, weight) => {
		if (!currentExercise || !reps || !weight) {
			showWarning("Please enter both reps and weight");
			return;
		}
		
		if (!session || !session._id) {
			console.error('No session or session ID available');
			showError('Workout session not available. Please restart workout.');
			return;
		}
		
		try {
			console.log('Logging set:', {
				sessionId: session._id,
				exerciseId: currentExercise.exerciseId,
				setNumber: currentSet,
				reps,
				weight,
				weightUnit
			});
			
			trackEvent("exercise_set_logging", {
				exerciseId: currentExercise.exerciseId,
				exerciseName: currentExercise.exerciseName,
				setNumber: currentSet,
				reps,
				weight,
				weightUnit
			});
			
			const response = await fetch(`http://localhost:5000/api/workouts/session/${session._id}/exercise`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({
					exerciseId: currentExercise.exerciseId,
					setNumber: currentSet,
					reps: parseInt(reps),
					weight: parseFloat(weight),
					weightUnit,
					notes: ''
				})
			});
			
			const data = await response.json();
			
			console.log('Set logging response:', data);
			
			if (response.ok) {
				onSessionUpdate(data.session);
				
				// Check for new personal records
				if (data.newPersonalRecords && data.records && data.records.length > 0) {
					setPrData(data.records);
					setShowPRNotification(true);
					
					// Show notification for 5 seconds
					setTimeout(() => {
						setShowPRNotification(false);
						setPrData(null);
					}, 5000);
				}
				
				// Move to next set or exercise
				if (currentSet >= currentExercise.targetSets) {
					// Complete current exercise
					await completeCurrentExercise();
					
					if (!isLastExercise) {
						// Move to next exercise
						setCurrentExerciseIndex(prev => prev + 1);
						setCurrentSet(1);
						
						// Start rest timer for exercise transition
						startRestTimer(currentExercise.exerciseRestTime || 90);
					} else {
						// Last exercise completed
						trackExerciseComplete(currentExercise.exerciseId, {
							completed: true,
							totalSets: currentExercise.targetSets,
							completedSets: currentExercise.targetSets
						});
						
						await completeWorkout();
					}
				} else {
					// Move to next set
					setCurrentSet(prev => prev + 1);
					
					// Start rest timer between sets
					startRestTimer(currentExercise.restTime || 60);
				}
			} else {
				throw new Error(data.error || 'Failed to log set');
			}
		} catch (error) {
			console.error('Error logging set:', error);
			showWorkoutError(error, 'log set', showError);
		}
	};
	
	const completeCurrentExercise = async () => {
		trackExerciseComplete(currentExercise.exerciseId, {
			completed: true,
			totalSets: currentExercise.targetSets,
			completedSets: currentSet
		});
	};
	
	const skipExercise = async () => {
		if (!confirm('Are you sure you want to skip this exercise?')) return;
		
		try {
			trackEvent("exercise_skip", {
				exerciseId: currentExercise.exerciseId,
				exerciseName: currentExercise.exerciseName,
				setCompleted: currentSet - 1,
				totalSets: currentExercise.targetSets
			});
			
			if (!isLastExercise) {
				setCurrentExerciseIndex(prev => prev + 1);
				setCurrentSet(1);
				startRestTimer(currentExercise.exerciseRestTime || 90);
			} else {
				await completeWorkout();
			}
		} catch (error) {
			console.error('Error skipping exercise:', error);
		}
	};
	
	const completeWorkout = async () => {
		if (!session || !session._id) {
			console.error('No session or session ID available for completion');
			showError('Workout session not available. Please restart workout.');
			return;
		}
		
		try {
			console.log('Completing workout:', session._id);
			
			trackWorkoutSession('complete', {
				duration: Math.round((new Date() - sessionStartTime) / (1000 * 60)),
				exercisesCompleted: session.exercises.filter(ex => ex.completedSets && ex.completedSets.length > 0).length,
				totalExercises: session.exercises.length
			});
			
			const data = await api.post(`${API_CONFIG.ENDPOINTS.WORKOUT_SESSION}/${session._id}/complete`, {
				notes: '',
				rating: null,
				felt: null
			});
			
			console.log('Complete workout response:', data);
			onComplete(data);
		} catch (error) {
			console.error('Error completing workout:', error);
			showWorkoutError(error, 'complete workout', showError);
		}
	};
	
	const abandonWorkout = async () => {
		if (!confirm('Are you sure you want to abandon this workout? Your progress will be saved but marked as incomplete.')) return;
		
		if (!session || !session._id) {
			console.error('No session or session ID available for abandon');
			showError('Workout session not available. Please restart workout.');
			return;
		}
		
		try {
			console.log('Abandoning workout:', session._id);
			
			trackWorkoutSession('abandon', {
				duration: Math.round((new Date() - sessionStartTime) / (1000 * 60)),
				exercisesCompleted: session.exercises.filter(ex => ex.completedSets && ex.completedSets.length > 0).length,
				totalExercises: session.exercises.length,
				currentExercise: currentExercise?.exerciseName,
				currentSet
			});
			
			const data = await api.post(`${API_CONFIG.ENDPOINTS.WORKOUT_SESSION}/${session._id}/abandon`, {
				notes: 'Workout abandoned during session'
			});
			
			console.log('Abandon workout response:', data);
			onAbandon(data);
		} catch (error) {
			console.error('Error abandoning workout:', error);
			showWorkoutError(error, 'abandon workout', showError);
		}
	};
	
	const goToPreviousExercise = () => {
		if (!isFirstExercise) {
			setCurrentExerciseIndex(prev => prev - 1);
			setCurrentSet(1);
			setIsResting(false);
			setRestTimeLeft(0);
		}
	};
	
	const goToNextExercise = () => {
		if (!isLastExercise) {
			setCurrentExerciseIndex(prev => prev + 1);
			setCurrentSet(1);
			setIsResting(false);
			setRestTimeLeft(0);
		}
	};
	
	if (!currentExercise) {
		return (
			<div className="workout-session-error">
				<p>No exercises found in this workout session.</p>
				<button onClick={onAbandon} className="btn btn-secondary">
					Exit Workout
				</button>
			</div>
		);
	}
	
	const completedSets = currentExercise.completedSets || [];
	const isCurrentSetCompleted = completedSets.some(set => set.setNumber === currentSet);
	
	return (
		<div className="workout-session">
			{/* PR Notification */}
			{showPRNotification && prData && (
				<div className="pr-notification">
					<div className="pr-notification-content">
						<h3>🎉 New Personal Record!</h3>
						<div className="pr-details">
							{prData.map(pr => (
								<p key={pr._id}>
									{pr.exerciseName}: {pr.recordType} PR - {pr.displayValue}
								</p>
							))}
						</div>
					</div>
				</div>
			)}
			
			{/* Workout Header */}
			<div className="workout-session-header">
				<div className="workout-info">
					{onBack && (
						<button onClick={onBack} className="btn btn-secondary back-btn">
							← Back to Exercises
						</button>
					)}
					<h2>{session.templateName}</h2>
					<div className="workout-progress">
						<span>Exercise {currentExerciseIndex + 1} of {session.exercises.length}</span>
						<div className="progress-bar">
							<div 
								className="progress-fill" 
								style={{ width: `${((currentExerciseIndex + 1) / session.exercises.length) * 100}%` }}
							/>
						</div>
					</div>
				</div>
				
				<div className="workout-actions">
					<button 
						onClick={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
						className="btn btn-secondary weight-unit-toggle"
					>
						{weightUnit === 'kg' ? 'Switch to lbs' : 'Switch to kg'}
					</button>
					<button 
						onClick={abandonWorkout}
						className="btn btn-danger abandon-btn"
					>
						Abandon Workout
					</button>
				</div>
			</div>
			
			{/* Exercise Content */}
			<div className="exercise-content">
				{!isResting ? (
					<>
						{/* Exercise Info */}
						<div className="exercise-info">
							<h3>{currentExercise.exerciseName}</h3>
							<p className="exercise-details">
								{currentExercise.muscleGroup} • Set {currentSet} of {currentExercise.targetSets}
								{currentExercise.targetReps && ` • ${currentExercise.targetReps} reps`}
							</p>
							
							{currentExercise.video && (
								<div className="exercise-video-container">
									<video 
										className="exercise-video" 
										controls 
										preload="metadata"
									>
										<source src={currentExercise.video} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								</div>
							)}
							
							{currentExercise.instructions && currentExercise.instructions.length > 0 && (
								<div className="exercise-instructions">
									<h4>Instructions:</h4>
									<ol>
										{currentExercise.instructions.map((instruction, idx) => (
											<li key={idx}>{instruction}</li>
										))}
									</ol>
								</div>
							)}
						</div>
						
						{/* Set Logging Form */}
						<div className="set-logging-form">
							<h4>Log Set {currentSet}</h4>
							
							{isCurrentSetCompleted ? (
								<div className="completed-set-info">
									<p>✅ Set {currentSet} completed</p>
									{completedSets.find(set => set.setNumber === currentSet) && (
										<p>
											{completedSets.find(set => set.setNumber === currentSet).reps} reps at {' '}
											{completedSets.find(set => set.setNumber === currentSet).weight}{' '}
											{completedSets.find(set => set.setNumber === currentSet).weightUnit}
										</p>
									)}
								</div>
							) : (
								<div className="set-inputs">
									<div className="input-group">
										<label>Reps</label>
										<input
											type="number"
											min="0"
											max="100"
											placeholder="Reps"
											id="reps-input"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													const weightInput = document.getElementById('weight-input');
													if (weightInput && weightInput.value) {
														logSet(e.target.value, weightInput.value);
													}
												}
											}}
										/>
									</div>
									
									<div className="input-group">
										<label>Weight ({weightUnit})</label>
										<input
											type="number"
											min="0"
											step="0.5"
											placeholder={`Weight (${weightUnit})`}
											id="weight-input"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													const repsInput = document.getElementById('reps-input');
													if (repsInput && repsInput.value) {
														logSet(repsInput.value, e.target.value);
													}
												}
											}}
										/>
									</div>
									
									<button
										onClick={() => {
											const repsInput = document.getElementById('reps-input');
											const weightInput = document.getElementById('weight-input');
											if (repsInput?.value && weightInput?.value) {
												logSet(repsInput.value, weightInput.value);
											}
										}}
										className="btn btn-primary complete-set-btn"
									>
										Complete Set
									</button>
								</div>
							)}
							
							<div className="exercise-actions">
								<button 
									onClick={skipExercise}
									className="btn btn-secondary skip-btn"
								>
									Skip Exercise
								</button>
								
								{isCurrentSetCompleted && (
									<button 
										onClick={() => {
											if (!isLastExercise) {
												setCurrentExerciseIndex(prev => prev + 1);
												setCurrentSet(1);
												startRestTimer(currentExercise.exerciseRestTime || 90);
											} else {
												completeWorkout();
											}
										}}
										className="btn btn-primary next-btn"
									>
										{isLastExercise ? 'Complete Workout' : 'Next Exercise'}
									</button>
								)}
							</div>
						</div>
					</>
				) : (
					/* Rest Timer */
					<div className="rest-timer">
						<h3>Rest Time</h3>
						<div className="timer-display">
							<span className="timer-value">{restTimeLeft}</span>
							<span className="timer-unit">seconds</span>
						</div>
						<div className="timer-progress">
							<div 
								className="timer-progress-fill" 
								style={{ 
									width: `${((currentExercise.restTime || 60 - restTimeLeft) / (currentExercise.restTime || 60)) * 100}%` 
								}}
							/>
						</div>
						<button 
							onClick={skipRestTimer}
							className="btn btn-secondary skip-rest-btn"
						>
							Skip Rest
						</button>
					</div>
				)}
			</div>
			
			{/* Navigation */}
			<div className="workout-navigation">
				<button 
					onClick={goToPreviousExercise}
					disabled={isFirstExercise}
					className="btn btn-secondary nav-btn"
				>
					← Previous Exercise
				</button>
				
				<span className="exercise-counter">
					{currentExerciseIndex + 1} / {session.exercises.length}
				</span>
				
				<button 
					onClick={goToNextExercise}
					disabled={isLastExercise}
					className="btn btn-secondary nav-btn"
				>
					Next Exercise →
				</button>
			</div>
		</div>
	);
}
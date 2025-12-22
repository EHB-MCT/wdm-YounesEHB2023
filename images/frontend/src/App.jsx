import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Exercises from "./components/Excercises.jsx";
import Auth from "./pages/Auth.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import WorkoutSession from "./components/WorkoutSession.jsx";
import UserProfile from "./components/UserProfile.jsx";
import WorkoutHistory from "./components/WorkoutHistory.jsx";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
	const [currentView, setCurrentView] = useState('exercises');
	const [activeSession, setActiveSession] = useState(null);

	useEffect(() => {
		// Check admin status on mount
		const adminStatus = localStorage.getItem("isAdmin") === "true";
		setIsAdmin(adminStatus);
	}, []);

	const handleLogin = (receivedToken) => {
		localStorage.setItem("token", receivedToken);
		setToken(receivedToken);
		// Clear any admin session when user logs in
		localStorage.removeItem("adminToken");
		localStorage.removeItem("isAdmin");
		setIsAdmin(false);
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("adminToken");
		localStorage.removeItem("isAdmin");
		setToken(null);
		setIsAdmin(false);
		setCurrentView('exercises');
		setActiveSession(null);
	};

	// Workout management functions
	const handleStartWorkout = async () => {
		try {
			// Start a custom workout for now
			const response = await fetch('http://localhost:5000/api/workouts/session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					customName: 'Custom Workout',
					customCategory: 'Custom',
					exercises: [] // User will add exercises
				})
			});

			if (response.ok) {
				const session = await response.json();
				setActiveSession(session);
				setCurrentView('workout');
			} else {
				throw new Error('Failed to start workout');
			}
		} catch (error) {
			console.error('Error starting workout:', error);
			alert('Failed to start workout. Please try again.');
		}
	};

	const handleSessionUpdate = (updatedSession) => {
		setActiveSession(updatedSession);
	};

	const handleWorkoutComplete = (completedSession) => {
		setActiveSession(null);
		setCurrentView('exercises');
		alert('Workout completed successfully! 🎉');
	};

	const handleWorkoutAbandon = (abandonedSession) => {
		setActiveSession(null);
		setCurrentView('exercises');
		alert('Workout abandoned. Your progress was saved.');
	};

	return (
		<>
			{/* Admin route */}
			{isAdmin && <AdminPage />}

			{/* Auth route */}
			{!token && !isAdmin && (
				<div className="auth-wrapper">
					<div className="welcome-header">
						<h1>💪 Gym Exercises</h1>
						<p>Welkom! Log in of maak een account om te beginnen</p>
					</div>
					<Auth onLogin={handleLogin} />
				</div>
			)}

			{/* User route */}
			{token && !isAdmin && (
				<div className="App">
					<header className="app-header">
						<div className="header-content">
							<div className="logo-section">
								<h1>💪 Gym Exercises</h1>
								<span className="tagline">Professional Workout Platform</span>
							</div>
							<button onClick={handleLogout} className="logout-btn">
								Log out
							</button>
						</div>
					</header>

					<main className="main-content">
						{currentView === 'exercises' && (
							<Exercises
								onStartWorkout={handleStartWorkout}
								onViewProfile={() => setCurrentView('profile')}
								onViewHistory={() => setCurrentView('history')}
								onCreateTemplate={() => alert('Template builder will be integrated soon')}
							/>
						)}
						
						{currentView === 'workout' && activeSession && (
							<WorkoutSession
								session={activeSession}
								onSessionUpdate={handleSessionUpdate}
								onComplete={handleWorkoutComplete}
								onAbandon={handleWorkoutAbandon}
							/>
						)}
						
						{currentView === 'profile' && (
							<UserProfile
								onBack={() => setCurrentView('exercises')}
							/>
						)}
						
						{currentView === 'history' && (
							<WorkoutHistory
								onBack={() => setCurrentView('exercises')}
							/>
						)}
					</main>
				</div>
			)}
		</>
	);
}

export default App;

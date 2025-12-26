import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Exercises from "./components/Exercises.jsx";
import Auth from "./pages/Auth.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import WorkoutSession from "./components/WorkoutSession.jsx";
import UserProfile from "./components/UserProfile.jsx";
import WorkoutHistory from "./components/WorkoutHistory.jsx";
import WorkoutTemplateBuilder from "./components/WorkoutTemplateBuilder.jsx";
import QuickWorkoutStarter from "./components/QuickWorkoutStarter.jsx";
import AllInOneWorkout from "./components/AllInOneWorkout.jsx";
import { NotificationProvider } from "./utils/notifications";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
	const [currentView, setCurrentView] = useState('main');
	const [activeSession, setActiveSession] = useState(null);
	const [templateMode, setTemplateMode] = useState(null); // 'create' or 'edit'
	const [editingTemplate, setEditingTemplate] = useState(null);

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
	const handleStartWorkout = async (session) => {
		try {
			// If a session is provided (from template), use it
			// Otherwise start a custom workout
			let workoutSession = session;
			
			if (!workoutSession) {
				const response = await fetch('http://localhost:5000/api/workouts/session', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`
					},
					body: JSON.stringify({
						customName: 'Custom Workout',
						customCategory: 'Custom',
						exercises: [] // User will add exercises
					})
				});

				if (response.ok) {
					workoutSession = await response.json();
				} else {
					throw new Error('Failed to start workout');
				}
			}
			
			setActiveSession(workoutSession);
			setCurrentView('workout');
		} catch (error) {
			console.error('Error starting workout:', error);
			alert('Failed to start workout. Please try again.');
		}
	};

	const handleCreateTemplate = () => {
		setTemplateMode('create');
		setEditingTemplate(null);
		setCurrentView('template-builder');
	};

	const handleEditTemplate = (template) => {
		setTemplateMode('edit');
		setEditingTemplate(template);
		setCurrentView('template-builder');
	};

	const handleTemplateSave = async (template) => {
		try {
			const isEditing = templateMode === 'edit' && editingTemplate;
			const url = isEditing 
				? `http://localhost:5000/api/workouts/template/${editingTemplate._id}`
				: 'http://localhost:5000/api/workouts/template';
			const method = isEditing ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(template)
			});

			if (response.ok) {
				alert(`Template ${isEditing ? 'updated' : 'created'} successfully!`);
				setCurrentView('exercises');
				setTemplateMode(null);
				setEditingTemplate(null);
			} else {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save template');
			}
		} catch (error) {
			console.error('Error saving template:', error);
			alert('Failed to save template: ' + error.message);
			throw error; // Re-throw to let the builder handle the UI state
		}
	};

	const handleTemplateCancel = () => {
		setCurrentView('exercises');
		setTemplateMode(null);
		setEditingTemplate(null);
	};

	const handleQuickWorkout = () => {
		setCurrentView('all-in-one-workout');
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
		<NotificationProvider>
			{/* Admin route */}
			{isAdmin && <AdminPage />}

			{/* Auth route */}
			{!token && !isAdmin && (
				<div className="auth-wrapper">
				<div className="welcome-header">
					<h1>💪 Gym Tracker Pro</h1>
					<p>Welcome! Track your workouts, build templates, and reach your fitness goals</p>
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
								onEditTemplate={handleEditTemplate}
							/>
						)}
						
						{currentView === 'workout' && activeSession && (
							<WorkoutSession
								session={activeSession}
								onSessionUpdate={handleSessionUpdate}
								onComplete={handleWorkoutComplete}
								onAbandon={handleWorkoutAbandon}
								onBack={() => setCurrentView('exercises')}
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
						
						{currentView === 'template-builder' && (
							<WorkoutTemplateBuilder
								onSave={handleTemplateSave}
								onCancel={handleTemplateCancel}
								initialTemplate={editingTemplate}
							/>
						)}
						
						{currentView === 'all-in-one-workout' && (
							<AllInOneWorkout
								onStartWorkout={(session) => {
									setActiveSession(session);
									setCurrentView('workout');
								}}
								onBack={() => setCurrentView('exercises')}
							/>
						)}
					</main>
				</div>
			)}
		</NotificationProvider>
	);
}

export default App;

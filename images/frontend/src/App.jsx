import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Exercises from "./components/Excercises.jsx";
import Auth from "./pages/Auth.jsx";
import AdminPage from "./pages/AdminPage.jsx";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

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
						<Routes>
							<Route path="/" element={<Exercises />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</main>
				</div>
			)}
		</>
	);
}

export default App;

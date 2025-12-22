import React, { useState } from "react";
import Exercises from "./components/Excercises.jsx";
import Auth from "./pages/Auth.jsx";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));

	// Gebruiker NIET ingelogd → toon Auth component
	if (!token) {
		return (
			<div className="auth-wrapper">
				<div className="welcome-header">
					<h1>💪 Gym Exercises Platform</h1>
					<p>Welkom! Log in of maak een account om te beginnen</p>
				</div>
				<Auth
					onLogin={(receivedToken) => {
						localStorage.setItem("token", receivedToken);
						setToken(receivedToken);
					}}
				/>
			</div>
		);
	}

	// Gebruiker IS ingelogd → toon de rest van de website
	return (
		<div className="App">
			<header className="app-header">
				<div className="header-content">
					<div className="logo-section">
						<h1>💪 Gym Exercises</h1>
						<span className="tagline">Professional Workout Platform</span>
					</div>
					<button
						onClick={() => {
							localStorage.removeItem("token");
							setToken(null);
						}}
						className="logout-btn"
					>
						Log out
					</button>
				</div>
			</header>

			<main className="main-content">
				<Exercises />
			</main>
		</div>
	);
}

export default App;

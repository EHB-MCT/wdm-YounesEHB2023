import React, { useState } from "react";
import Exercises from "./components/Excercises.jsx";
import Auth from "./pages/Auth.jsx";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));

	// Gebruiker NIET ingelogd → toon Auth component
	if (!token) {
		return (
			<div style={{ padding: "20px" }}>
				<h1>Welkom! log in of ak een account</h1>
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
			<button
				onClick={() => {
					localStorage.removeItem("token");
					setToken(null);
				}}
				style={{ position: "absolute", top: 10, right: 10 }}
			>
				Log out
			</button>

			<Exercises />
		</div>
	);
}

export default App;

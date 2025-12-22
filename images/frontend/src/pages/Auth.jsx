import React, { useState } from "react";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

export default function Auth({ onLogin }) {
	const [isLogin, setIsLogin] = useState(true);

	const toggleAuth = () => {
		setIsLogin(!isLogin);
	};

	return (
		<div className="auth-container">
			<div className="auth-toggle">
				<button
					type="button"
					className={`toggle-btn ${isLogin ? "active" : ""}`}
					onClick={() => setIsLogin(true)}
				>
					Login
				</button>
				<button
					type="button"
					className={`toggle-btn ${!isLogin ? "active" : ""}`}
					onClick={() => setIsLogin(false)}
				>
					Sign Up
				</button>
			</div>

			{isLogin ? (
				<Login onLogin={onLogin} />
			) : (
				<Signup onSwitchToLogin={toggleAuth} />
			)}
		</div>
	);
}
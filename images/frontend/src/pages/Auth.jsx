import React, { useState } from "react";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import AdminButton from "../components/AdminButton.jsx";

export default function Auth({ onLogin }) {
	const [isLogin, setIsLogin] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);

	// Check if admin is already logged in
	React.useEffect(() => {
		const adminToken = localStorage.getItem('adminToken');
		if (adminToken) {
			setIsAdmin(true);
		}
	}, []);

	const toggleAuth = () => {
		setIsLogin(!isLogin);
	};

	const handleAdminLogin = (adminToken) => {
		// Store admin session and redirect to admin page
		localStorage.setItem('adminToken', adminToken);
		localStorage.setItem('isAdmin', 'true');
		setIsAdmin(true);
		// Redirect to admin page will be handled by App.jsx
		window.location.href = '/admin';
	};

	const handleRegularLogin = (token) => {
		// Clear any admin session
		localStorage.removeItem('adminToken');
		localStorage.removeItem('isAdmin');
		setIsAdmin(false);
		onLogin(token);
	};

	// If admin is logged in, show admin session
	if (isAdmin) {
		return (
			<div className="auth-container">
				<div className="admin-session-info">
					<h2>🔐 Admin Session Active</h2>
					<p>You are currently logged in as an administrator.</p>
					<div className="admin-session-actions">
						<button 
							className="submit-btn"
							onClick={() => window.location.href = '/admin'}
						>
							Go to Admin Dashboard
						</button>
						<button 
							className="logout-btn"
							onClick={() => {
								localStorage.removeItem('adminToken');
								localStorage.removeItem('isAdmin');
								setIsAdmin(false);
							}}
						>
							End Admin Session
						</button>
					</div>
				</div>
			</div>
		);
	}

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
				<Login onLogin={handleRegularLogin} />
			) : (
				<Signup onSwitchToLogin={toggleAuth} />
			)}

			<AdminButton onAdminLogin={handleAdminLogin} />
		</div>
	);
}
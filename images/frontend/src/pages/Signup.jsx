import React, { useState } from "react";

export default function Signup({ onSwitchToLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");

	const handleSignup = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch("http://localhost:5000/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setMsg(data.error || "Signup failed");
				return;
			}

			setMsg("Account created! You can now log in.");
			setTimeout(() => {
				onSwitchToLogin();
			}, 1500);
		} catch (error) {
			console.error(error);
			setMsg("Signup failed (network error)");
		}
	};

	return (
		<form onSubmit={handleSignup} className="auth-form">
			<div className="form-group">
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
			</div>

			<div className="form-group">
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
			</div>

			<button type="submit" className="submit-btn">Sign Up</button>

			{msg && <p className={`auth-msg ${msg.includes("failed") ? "error" : "success"}`}>{msg}</p>}
		</form>
	);
}

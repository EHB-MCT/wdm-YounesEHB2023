import React, { useState } from "react";

export default function Login({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch("http://localhost:5000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (data.token) {
				// store userId for client-side features and let App handle token state
				if (data.userId) localStorage.setItem("userId", data.userId);

				// notify parent to update token and re-render app
				if (typeof onLogin === "function") onLogin(data.token);

				setMsg("Logged in!");
			} else {
				setMsg(data.error || "Login failed");
			}
		} catch (err) {
			console.error("Login error:", err);
			setMsg("Login failed (network error)");
		}
	};

	return (
		<form onSubmit={handleLogin} className="auth-form">
			<h2>Login</h2>

			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>

			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>

			<button type="submit">Login</button>

			{msg && <p className="auth-msg">{msg}</p>}
		</form>
	);
}

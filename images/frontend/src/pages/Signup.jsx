import React, { useState } from "react";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

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
				alert(data.error || "Signup failed");
				return;
			}

			alert("Account created!");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<form onSubmit={handleSignup} className="auth-form">
			<h2>Sign Up</h2>

			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>

			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>

			<button type="submit">Sign Up</button>
		</form>
	);
}

import React, { useState } from 'react';

export default function AdminButton({ onAdminLogin }) {
	const [showAdminForm, setShowAdminForm] = useState(false);
	const [adminPassword, setAdminPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleAdminLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('http://localhost:5000/api/admin/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ password: adminPassword }),
			});

			const data = await response.json();

			if (response.ok) {
				// Store admin token
				localStorage.setItem('adminToken', data.token);
				localStorage.setItem('isAdmin', 'true');
				onAdminLogin(data.token);
			} else {
				setError(data.error || 'Invalid admin password');
			}
		} catch {
			setError('Connection error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-login-section">
			{!showAdminForm ? (
				<button
					type="button"
					className="admin-toggle-btn"
					onClick={() => setShowAdminForm(true)}
				>
					🔐 Admin? Log in here
				</button>
			) : (
				<div className="admin-form">
					<div className="admin-form-header">
						<h3>Admin Login</h3>
						<button
							type="button"
							className="admin-close-btn"
							onClick={() => setShowAdminForm(false)}
						>
							✕
						</button>
					</div>
					
					<form onSubmit={handleAdminLogin}>
						<div className="form-group">
							<label htmlFor="admin-password">Admin Password:</label>
							<input
								id="admin-password"
								type="password"
								value={adminPassword}
								onChange={(e) => setAdminPassword(e.target.value)}
								placeholder="Enter admin password"
								disabled={loading}
							/>
						</div>

						{error && <div className="auth-msg error">{error}</div>}

						<button 
							type="submit" 
							className="submit-btn"
							disabled={loading || !adminPassword}
						>
							{loading ? 'Logging in...' : 'Login as Admin'}
						</button>
					</form>

					<div className="admin-hint">
						<p>Hint: Password is "admin"</p>
					</div>
				</div>
			)}
		</div>
	);
}
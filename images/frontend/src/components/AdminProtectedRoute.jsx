import React, { useEffect } from 'react';

export default function AdminProtectedRoute({ children }) {
	const adminToken = localStorage.getItem('adminToken');

	useEffect(() => {
		if (!adminToken) {
			// Redirect to login page if no admin token
			window.location.href = '/';
		}
	}, [adminToken]);

	if (!adminToken) {
		return (
			<div className="admin-loading">
				<div className="loading-text">Redirecting to admin login...</div>
			</div>
		);
	}

	return children;
}
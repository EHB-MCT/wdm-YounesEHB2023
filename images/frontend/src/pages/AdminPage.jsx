import React from 'react';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
	return (
		<AdminProtectedRoute>
			<AdminDashboard />
		</AdminProtectedRoute>
	);
}
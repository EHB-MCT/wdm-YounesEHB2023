import React, { useState, useEffect, useCallback } from 'react';

export default function AdminDashboard() {
	const [users, setUsers] = useState([]);
	const [userInsights, setUserInsights] = useState([]);
	const [stats, setStats] = useState({ totalUsers: 0, motivatedUsers: 0, unmotivatedUsers: 0, expertUsers: 0, newUsers: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedUser, setSelectedUser] = useState(null);

	const adminToken = localStorage.getItem('adminToken');

	const fetchAdminData = useCallback(async () => {
		try {
			const [usersResponse, statsResponse, insightsResponse] = await Promise.all([
				fetch('http://localhost:5000/api/admin/users', {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch('http://localhost:5000/api/admin/stats', {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch('http://localhost:5000/api/admin/insights', {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				})
			]);

			if (usersResponse.ok && statsResponse.ok && insightsResponse.ok) {
				const usersData = await usersResponse.json();
				const statsData = await statsResponse.json();
				const insightsData = await insightsResponse.json();
				
				setUsers(usersData);
				setStats(statsData);
				setUserInsights(insightsData);
			} else {
				throw new Error('Failed to fetch admin data');
			}
		} catch {
			setError('Failed to load admin data');
		} finally {
			setLoading(false);
		}
	}, [adminToken]);

	useEffect(() => {
		fetchAdminData();
	}, [fetchAdminData]);

	const handleLogout = () => {
		localStorage.removeItem('adminToken');
		localStorage.removeItem('isAdmin');
		window.location.href = '/';
	};

	if (loading) {
		return (
			<div className="admin-dashboard">
				<div className="loading-text">Loading admin dashboard...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="admin-dashboard">
				<div className="error-message">{error}</div>
			</div>
		);
	}

	return (
		<div className="admin-dashboard">
			<header className="admin-header">
				<div className="admin-header-content">
					<div>
						<h1>🔐 Admin Dashboard</h1>
						<p>Platform Overview & Management</p>
					</div>
					<button className="logout-btn" onClick={handleLogout}>
						Admin Logout
					</button>
				</div>
			</header>

			<main className="admin-main">
				{/* Stats Overview */}
				<section className="admin-stats">
					<h2>Platform Statistics</h2>
					<div className="stats-grid">
						<div className="stat-card">
							<div className="stat-number">{stats.totalUsers}</div>
							<div className="stat-label">Total Users</div>
						</div>
						<div className="stat-card stat-motivated">
							<div className="stat-number">{stats.motivatedUsers}</div>
							<div className="stat-label">Motivated</div>
						</div>
						<div className="stat-card stat-unmotivated">
							<div className="stat-number">{stats.unmotivatedUsers}</div>
							<div className="stat-label">Unmotivated</div>
						</div>
						<div className="stat-card stat-expert">
							<div className="stat-number">{stats.expertUsers}</div>
							<div className="stat-label">Expert</div>
						</div>
						<div className="stat-card stat-new">
							<div className="stat-number">{stats.newUsers}</div>
							<div className="stat-label">New</div>
						</div>
					</div>
				</section>

	{/* Users Table with Insights */}
				<section className="admin-users">
					<h2>User Management & Insights</h2>
					<div className="users-table-container">
						<table className="users-table">
							<thead>
								<tr>
									<th>Email</th>
									<th>User Type</th>
									<th>Engagement</th>
									<th>Completion Rate</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{userInsights.length > 0 ? (
									userInsights.map((user, index) => (
										<tr key={user.id || index}>
											<td>{user.email}</td>
											<td>
												<span className={`profile-badge profile-${user.userType.toLowerCase()}`}>
													{user.userType}
												</span>
											</td>
											<td>
												<div className="engagement-score">
													<div className="score-bar">
														<div 
															className="score-fill" 
															style={{ width: `${(user.metrics.engagementScore || 0) * 100}%` }}
														></div>
													</div>
													<span>{Math.round((user.metrics.engagementScore || 0) * 100)}%</span>
												</div>
											</td>
											<td>
												<span className={`completion-rate ${user.metrics.completionRate > 0.7 ? 'high' : user.metrics.completionRate > 0.4 ? 'medium' : 'low'}`}>
													{Math.round((user.metrics.completionRate || 0) * 100)}%
												</span>
											</td>
											<td>
												<button 
													className="view-insights-btn"
													onClick={() => setSelectedUser(user)}
												>
													View Details
												</button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="5" className="no-users">No user insights available</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				{/* User Details Modal */}
				{selectedUser && (
					<div className="user-details-modal" onClick={() => setSelectedUser(null)}>
						<div className="modal-content" onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h3>User Insights: {selectedUser.name}</h3>
								<button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
							</div>
							<div className="modal-body">
								<div className="user-detail-section">
									<h4>Basic Information</h4>
									<p><strong>Email:</strong> {selectedUser.email}</p>
									<p><strong>User Type:</strong> <span className={`profile-badge profile-${selectedUser.userType.toLowerCase()}`}>{selectedUser.userType}</span></p>
								</div>
								
								<div className="user-detail-section">
									<h4>Performance Metrics</h4>
									<p><strong>Total Interactions:</strong> {selectedUser.metrics.totalInteractions}</p>
									<p><strong>Workout Sessions:</strong> {selectedUser.metrics.workoutSessions}</p>
									<p><strong>Workout Completion Rate:</strong> {Math.round((selectedUser.metrics.workoutCompletionRate || 0) * 100)}%</p>
									<p><strong>Consistency Score:</strong> {Math.round((selectedUser.metrics.consistencyScore || 0) * 100)}%</p>
								</div>

								<div className="user-detail-section">
									<h4>Top Exercises</h4>
									{selectedUser.topExercises.length > 0 ? (
										<ul className="top-exercises">
											{selectedUser.topExercises.map((exercise, index) => (
												<li key={index}>
													Exercise ID: {exercise.exerciseId} ({exercise.interactionCount} interactions)
												</li>
											))}
										</ul>
									) : (
										<p>No exercise data available</p>
									)}
								</div>

								<div className="user-detail-section">
									<h4>Insights & Recommendations</h4>
									<ul className="insights-list">
										{selectedUser.insights.map((insight, index) => (
											<li key={index}>{insight}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Quick Actions */}
				<section className="admin-actions">
					<h2>Quick Actions</h2>
					<div className="actions-grid">
						<button className="action-btn" onClick={() => window.location.href = '/'}>
							🏋️ View User Application
						</button>
						<button className="action-btn action-secondary" onClick={fetchAdminData}>
							🔄 Refresh Data
						</button>
					</div>
				</section>
			</main>
		</div>
	);
}
import React, { useState, useEffect, useCallback } from 'react';

export default function AdminDashboard() {
	const [users, setUsers] = useState([]);
	const [userInsights, setUserInsights] = useState([]);
	const [stats, setStats] = useState({ totalUsers: 0, motivatedUsers: 0, unmotivatedUsers: 0, expertUsers: 0, newUsers: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedUser, setSelectedUser] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState('all');

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

	const getFilteredUsers = () => {
		let filtered = userInsights;
		
		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(user => 
				user.email.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		
		// Apply type filter
		if (filterType !== 'all') {
			filtered = filtered.filter(user => 
				user.userType.toLowerCase() === filterType
			);
		}
		
		return filtered;
	};

	if (loading) {
		return (
			<div className="admin-dashboard">
				<div className="loading-text">
					<div className="loading-spinner"></div>
					Loading admin dashboard...
				</div>
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
					
					{/* Search and Filter Controls */}
					<div className="users-controls">
						<div className="search-container">
							<input
								type="text"
								placeholder="Search users by email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="search-input"
							/>
						</div>
						<div className="filter-container">
							<select
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
								className="filter-select"
							>
								<option value="all">All Users</option>
								<option value="motivated">Motivated</option>
								<option value="unmotivated">Unmotivated</option>
								<option value="expert">Expert</option>
								<option value="new">New</option>
							</select>
						</div>
					</div>
					
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
								{getFilteredUsers().length > 0 ? (
									getFilteredUsers().map((user, index) => (
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
										<td colSpan="5" className="no-users">
											{userInsights.length === 0 ? 'No user insights available' : 'No users match your search criteria'}
										</td>
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
								<h3>User Insights: {selectedUser.name || selectedUser.email}</h3>
								<button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
							</div>
							<div className="modal-body">
								<div className="user-detail-section">
									<h4>📋 Basic Information</h4>
									<p><strong>Email:</strong> {selectedUser.email}</p>
									<p><strong>User Type:</strong> <span className={`profile-badge profile-${selectedUser.userType.toLowerCase()}`}>{selectedUser.userType}</span></p>
								</div>
								
								<div className="user-detail-section">
									<h4>📊 Performance Metrics</h4>
									<div className="metrics-grid">
										<div className="metric-item">
											<span className="metric-label">Total Interactions</span>
											<span className="metric-value">{selectedUser.metrics?.totalInteractions || 0}</span>
										</div>
										<div className="metric-item">
											<span className="metric-label">Workout Sessions</span>
											<span className="metric-value">{selectedUser.metrics?.workoutSessions || 0}</span>
										</div>
										<div className="metric-item">
											<span className="metric-label">Completion Rate</span>
											<span className="metric-value">{Math.round((selectedUser.metrics?.workoutCompletionRate || 0) * 100)}%</span>
										</div>
										<div className="metric-item">
											<span className="metric-label">Consistency Score</span>
											<span className="metric-value">{Math.round((selectedUser.metrics?.consistencyScore || 0) * 100)}%</span>
										</div>
									</div>
								</div>

								<div className="user-detail-section">
									<h4>💪 Top Exercises</h4>
									{selectedUser.topExercises && selectedUser.topExercises.length > 0 ? (
										<ul className="top-exercises">
											{selectedUser.topExercises.map((exercise, index) => (
												<li key={index}>
													<span className="exercise-name">Exercise ID: {exercise.exerciseId}</span>
													<span className="exercise-count">{exercise.interactionCount} interactions</span>
												</li>
											))}
										</ul>
									) : (
										<p className="no-data">No exercise data available</p>
									)}
								</div>

								<div className="user-detail-section">
									<h4>💡 Insights & Recommendations</h4>
									{selectedUser.insights && selectedUser.insights.length > 0 ? (
										<ul className="insights-list">
											{selectedUser.insights.map((insight, index) => (
												<li key={index}>{insight}</li>
											))}
										</ul>
									) : (
										<p className="no-data">No insights available</p>
									)}
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
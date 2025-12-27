import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler);

export default function AdminDashboard() {
	const [users, setUsers] = useState([]);
	const [userInsights, setUserInsights] = useState([]);
	const [stats, setStats] = useState({ totalUsers: 0, motivatedUsers: 0, unmotivatedUsers: 0, expertUsers: 0, newUsers: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedUser, setSelectedUser] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState('all');
	
	// Chart data states
	const [chartData, setChartData] = useState({
		userGrowth: null,
		workoutFrequency: null,
		activityHeatmap: null,
		userTypeDistribution: null
	});
	const [chartPeriod, setChartPeriod] = useState('month');
	
	// Enhanced user detail states
	const [userDetailData, setUserDetailData] = useState({
		activityTimeline: null,
		personalRecords: null,
		workoutSummary: null
	});

	const adminToken = localStorage.getItem('adminToken');

	const fetchUserDetailData = async (userId) => {
		try {
			const [activityResponse, recordsResponse, summaryResponse] = await Promise.all([
				fetch(`http://localhost:5000/api/admin/users/${userId}/activity-timeline?limit=5`, {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch(`http://localhost:5000/api/admin/users/${userId}/personal-records`, {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch(`http://localhost:5000/api/admin/users/${userId}/workout-summary`, {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				})
			]);

			const [activityData, recordsData, summaryData] = await Promise.all([
				activityResponse.ok ? activityResponse.json() : null,
				recordsResponse.ok ? recordsResponse.json() : null,
				summaryResponse.ok ? summaryResponse.json() : null
			]);

			setUserDetailData({
				activityTimeline: activityData,
				personalRecords: recordsData,
				workoutSummary: summaryData
			});
		} catch (error) {
			console.error('Error fetching user detail data:', error);
		}
	};

		const fetchAdminData = useCallback(async () => {
		try {
			const [usersResponse, statsResponse, insightsResponse, ...chartResponses] = await Promise.all([
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
				}),
				// Chart data endpoints
				fetch(`http://localhost:5000/api/admin/charts/user-growth?period=${chartPeriod}`, {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch(`http://localhost:5000/api/admin/charts/workout-frequency?period=${chartPeriod}`, {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch(`http://localhost:5000/api/admin/charts/activity-heatmap?period=${chartPeriod}`, {
					headers: {
						'Authorization': `Bearer ${adminToken}`
					}
				}),
				fetch('http://localhost:5000/api/admin/charts/user-type-distribution', {
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

			// Handle chart data
			const [userGrowthResponse, workoutFrequencyResponse, activityHeatmapResponse, userTypeDistributionResponse] = chartResponses;
			
			if (userGrowthResponse.ok) {
				const userGrowthData = await userGrowthResponse.json();
				setChartData(prev => ({ ...prev, userGrowth: userGrowthData }));
			}
			
			if (workoutFrequencyResponse.ok) {
				const workoutFrequencyData = await workoutFrequencyResponse.json();
				setChartData(prev => ({ ...prev, workoutFrequency: workoutFrequencyData }));
			}
			
			if (activityHeatmapResponse.ok) {
				const activityHeatmapData = await activityHeatmapResponse.json();
				setChartData(prev => ({ ...prev, activityHeatmap: activityHeatmapData }));
			}
			
			if (userTypeDistributionResponse.ok) {
				const userTypeDistributionData = await userTypeDistributionResponse.json();
				setChartData(prev => ({ ...prev, userTypeDistribution: userTypeDistributionData }));
			}

		} catch {
			setError('Failed to load admin data');
		} finally {
			setLoading(false);
		}
	}, [adminToken, chartPeriod]);

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

	// Chart preparation functions
	const prepareUserGrowthChart = () => {
		if (!chartData.userGrowth?.data) return null;
		
		return {
			labels: chartData.userGrowth.data.map(item => {
				const date = new Date(item.date);
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			}),
			datasets: [
				{
					label: 'New Users',
					data: chartData.userGrowth.data.map(item => item.newUsers),
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					borderWidth: 2,
					tension: 0.4,
					fill: true
				},
				{
					label: 'Total Users',
					data: chartData.userGrowth.data.map(item => item.totalUsers),
					borderColor: '#10b981',
					backgroundColor: 'rgba(16, 185, 129, 0.1)',
					borderWidth: 2,
					tension: 0.4,
					fill: true
				}
			]
		};
	};

	const prepareUserTypeDistributionChart = () => {
		if (!chartData.userTypeDistribution) return null;
		
		return {
			labels: ['Motivated', 'Unmotivated', 'Expert', 'New'],
			datasets: [
				{
					data: [
						chartData.userTypeDistribution.motivatedUsers,
						chartData.userTypeDistribution.unmotivatedUsers,
						chartData.userTypeDistribution.expertUsers,
						chartData.userTypeDistribution.newUsers
					],
					backgroundColor: [
						'#10b981',
						'#ef4444',
						'#3b82f6',
						'#f59e0b'
					],
					borderWidth: 0
				}
			]
		};
	};

	const prepareWorkoutFrequencyChart = () => {
		if (!chartData.workoutFrequency?.data?.frequencyDistribution) return null;
		
		const distribution = chartData.workoutFrequency.data.frequencyDistribution;
		
		return {
			labels: Object.keys(distribution),
			datasets: [
				{
					label: 'Users',
					data: Object.values(distribution),
					backgroundColor: '#8b5cf6',
					borderWidth: 0,
					borderRadius: 4
				}
			]
		};
	};

	const prepareActivityHeatmapChart = () => {
		if (!chartData.activityHeatmap?.heatmapData) return null;
		
		// Group data by hour for simplicity
		const hourlyActivity = new Array(24).fill(0);
		chartData.activityHeatmap.heatmapData.forEach(item => {
			hourlyActivity[item.hour] += item.activity;
		});
		
		return {
			labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
			datasets: [
				{
					label: 'Activity Level',
					data: hourlyActivity,
					backgroundColor: '#f59e0b',
					borderWidth: 0,
					borderRadius: 4
				}
			]
		};
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

				{/* Charts Section */}
				<section className="admin-charts">
					<div className="charts-header">
						<h2>Platform Analytics</h2>
						<div className="chart-controls">
							<select
								value={chartPeriod}
								onChange={(e) => setChartPeriod(e.target.value)}
								className="period-select"
							>
								<option value="week">This Week</option>
								<option value="month">This Month</option>
								<option value="quarter">This Quarter</option>
								<option value="year">This Year</option>
							</select>
						</div>
					</div>
					
					<div className="charts-container">
						<div className="charts-row">
							{/* User Growth Chart - Large Full Width */}
							<div className="chart-card large">
								<div className="chart-header">
									<h3>User Growth Trend</h3>
									<span className="chart-subtitle">New and total users over time</span>
								</div>
								<div className="chart-wrapper">
									{prepareUserGrowthChart() && (
										<Line 
											data={prepareUserGrowthChart()} 
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: {
														labels: { color: '#cbd5e1' }
													}
												},
												scales: {
													x: {
														grid: { color: 'rgba(255, 255, 255, 0.1)' },
														ticks: { color: '#cbd5e1' }
													},
													y: {
														grid: { color: 'rgba(255, 255, 255, 0.1)' },
														ticks: { color: '#cbd5e1' }
													}
												}
											}}
										/>
									)}
								</div>
							</div>
						</div>
						
						<div className="charts-row">
							{/* User Type Distribution Chart */}
							<div className="chart-card">
								<div className="chart-header">
									<h3>User Type Distribution</h3>
									<span className="chart-subtitle">Current user categories</span>
								</div>
								<div className="chart-wrapper">
									{prepareUserTypeDistributionChart() && (
										<Doughnut 
											data={prepareUserTypeDistributionChart()} 
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: {
														position: 'bottom',
														labels: { color: '#cbd5e1', padding: 10 }
													}
												}
											}}
										/>
									)}
								</div>
							</div>
							
							{/* Workout Frequency Chart */}
							<div className="chart-card">
								<div className="chart-header">
									<h3>Workout Frequency</h3>
									<span className="chart-subtitle">User workout participation</span>
								</div>
								<div className="chart-wrapper">
									{prepareWorkoutFrequencyChart() && (
										<Bar 
											data={prepareWorkoutFrequencyChart()} 
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: { display: false }
												},
												scales: {
													x: {
														grid: { display: false },
														ticks: { color: '#cbd5e1' }
													},
													y: {
														grid: { color: 'rgba(255, 255, 255, 0.1)' },
														ticks: { color: '#cbd5e1' }
													}
												}
											}}
										/>
									)}
								</div>
							</div>
							
							{/* Activity Heatmap Chart */}
							<div className="chart-card">
								<div className="chart-header">
									<h3>Activity by Hour</h3>
									<span className="chart-subtitle">Platform usage throughout the day</span>
								</div>
								<div className="chart-wrapper">
									{prepareActivityHeatmapChart() && (
										<Bar 
											data={prepareActivityHeatmapChart()} 
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: { display: false }
												},
												scales: {
													x: {
														grid: { display: false },
														ticks: { 
															color: '#cbd5e1',
															maxTicksLimit: 6
														}
													},
													y: {
														grid: { color: 'rgba(255, 255, 255, 0.1)' },
														ticks: { color: '#cbd5e1' }
													}
												}
											}}
										/>
									)}
								</div>
							</div>
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
													onClick={() => {
														setSelectedUser(user);
														fetchUserDetailData(user.id);
													}}
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
									<h4>📅 Activity Timeline</h4>
									{userDetailData.activityTimeline && userDetailData.activityTimeline.length > 0 ? (
										<div className="timeline-list">
											{userDetailData.activityTimeline.map((session, index) => (
												<div key={index} className="timeline-item">
													<div className="timeline-date">
														{new Date(session.startTime).toLocaleDateString()}
													</div>
													<div className="timeline-details">
														<strong>{session.templateName}</strong>
														<div className="timeline-meta">
															<span>{session.category}</span>
															<span>{session.duration} min</span>
															<span className={session.status === 'completed' ? 'status-complete' : 'status-incomplete'}>
																{session.status}
															</span>
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="no-data">No recent activity</p>
									)}
								</div>

								<div className="user-detail-section">
									<h4>🏆 Personal Records</h4>
									{userDetailData.personalRecords && userDetailData.personalRecords.length > 0 ? (
										<div className="records-grid">
											{userDetailData.personalRecords.slice(0, 6).map((record, index) => (
												<div key={index} className="record-item">
													<div className="record-exercise">{record.exerciseName}</div>
													<div className="record-value">{record.displayValue}</div>
													<div className="record-type">{record.recordType}</div>
												</div>
											))}
										</div>
									) : (
										<p className="no-data">No personal records yet</p>
									)}
								</div>

								<div className="user-detail-section">
									<h4>📊 Workout Summary</h4>
									{userDetailData.workoutSummary?.allTime ? (
										<div className="summary-stats">
											<div className="summary-stat">
												<span className="stat-label">Total Workouts</span>
												<span className="stat-value">{userDetailData.workoutSummary.allTime.totalWorkouts || 0}</span>
											</div>
											<div className="summary-stat">
												<span className="stat-label">Total Volume</span>
												<span className="stat-value">{userDetailData.workoutSummary.allTime.totalVolume || 0}</span>
											</div>
											<div className="summary-stat">
												<span className="stat-label">Avg Duration</span>
												<span className="stat-value">{userDetailData.workoutSummary.allTime.averageDuration || 0} min</span>
											</div>
											<div className="summary-stat">
												<span className="stat-label">Completion Rate</span>
												<span className="stat-value">{Math.round((userDetailData.workoutSummary.allTime.completionRate || 0) * 100)}%</span>
											</div>
										</div>
									) : (
										<p className="no-data">No workout summary available</p>
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
						<button className="action-btn action-secondary" onClick={fetchAdminData}>
							🔄 Refresh Data
						</button>
					</div>
				</section>
			</main>
		</div>
	);
}
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement);

export default function UserProfile({ onBack }) {
	const [selectedPeriod, setSelectedPeriod] = useState('month');
	const [stats, setStats] = useState(null);
	const [allTimeStats, setAllTimeStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState('overview');
	
	const periods = [
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' },
		{ value: 'year', label: 'This Year' }
	];
	
	const categoryColors = {
		'Upper Body': '#3b82f6',
		'Lower Body': '#ef4444', 
		'Full Body': '#10b981',
		'Core': '#f59e0b',
		'Cardio': '#8b5cf6',
		'Custom': '#6b7280'
	};
	
	useEffect(() => {
		fetchStats();
		fetchAllTimeStats();
	}, [selectedPeriod]);
	
	const fetchStats = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const response = await fetch(`http://localhost:5000/api/workouts/stats/${selectedPeriod}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to fetch statistics: ${response.status} ${errorText}`);
			}
			
			const data = await response.json();
			
			if (!data || data.totalWorkouts === 0 || Object.keys(data).length === 0) {
				setStats({ totalWorkouts: 0 });
			} else {
				setStats(data);
			}
		} catch (error) {
			console.error('Error fetching stats:', error);
			setError(`Failed to load statistics: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};
	
	const fetchAllTimeStats = async () => {
		try {
			const response = await fetch('http://localhost:5000/api/workouts/stats/all-time', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				setAllTimeStats(data);
			}
		} catch (error) {
			console.error('Error fetching all-time stats:', error);
		}
	};
	
	const formatNumber = (num) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	};
	
	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	};
	
	const prepareVolumeChart = () => {
		if (!stats?.frequencyData) return null;
		
		const data = stats.frequencyData.filter(day => day.volume > 0);
		
		return {
			labels: data.map(d => formatDate(d.date)),
			datasets: [{
				label: 'Volume (kg)',
				data: data.map(d => d.volume),
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 2,
				tension: 0.4,
				fill: true
			}]
		};
	};
	
	const prepareMuscleGroupChart = () => {
		if (!stats?.muscleGroupStats) return null;
		
		return {
			labels: stats.muscleGroupStats.map(m => m.muscleGroup),
			datasets: [{
				label: 'Total Volume (kg)',
				data: stats.muscleGroupStats.map(m => m.totalVolume),
				backgroundColor: stats.muscleGroupStats.map(m => 
					categoryColors[m.muscleGroup] || '#6b7280'
				),
				borderRadius: 8
			}]
		};
	};
	
	const prepareCategoryDistribution = () => {
		if (!stats?.muscleGroupStats) {
			return {
				labels: [],
				datasets: [{
					data: [],
					backgroundColor: []
				}]
			};
		}
		
		const categoryData = {};
		stats.muscleGroupStats.forEach(m => {
			categoryData[m.muscleGroup] = m.totalSessions || 0;
		});
		
		const activeCategories = Object.keys(categoryData).filter(cat => categoryData[cat] > 0);
		
		if (activeCategories.length === 0) {
			return {
				labels: [],
				datasets: [{
					data: [],
					backgroundColor: []
				}]
			};
		}
		
		return {
			labels: activeCategories,
			datasets: [{
				data: activeCategories.map(cat => categoryData[cat]),
				backgroundColor: activeCategories.map(cat => categoryColors[cat] || '#6b7280'),
				borderWidth: 2,
				borderColor: '#fff'
			}]
		};
	};
	
	if (loading && !stats) {
		return (
			<div className="progress-dashboard">
				<div className="progress-header">
					<h1>📊 Your Progress</h1>
				</div>
				<div className="loading-state">
					<div className="loading-spinner"></div>
					<p>Loading your fitness journey...</p>
				</div>
			</div>
		);
	}
	
	if (error) {
		return (
			<div className="progress-dashboard">
				<div className="progress-header">
					<h1>📊 Your Progress</h1>
				</div>
				<div className="error-state">
					<p>{error}</p>
					<div className="error-actions">
						<button onClick={fetchStats} className="btn btn-primary">Retry</button>
						<button onClick={onBack} className="btn btn-secondary">Back</button>
					</div>
				</div>
			</div>
		);
	}
	
	return (
		<div className="progress-dashboard">
			{/* Header */}
			<div className="progress-header">
				<button onClick={onBack} className="btn btn-icon back-button">
					←
				</button>
				<h1>📊 Your Progress</h1>
				<div className="period-selector">
					{periods.map(period => (
						<button
							key={period.value}
							onClick={() => setSelectedPeriod(period.value)}
							className={`tab-btn ${selectedPeriod === period.value ? 'active' : ''}`}
						>
							{period.label}
						</button>
					))}
				</div>
			</div>
			
			{/* Empty State */}
			{!loading && (!stats || stats.totalWorkouts === 0) && (
				<div className="empty-progress-state">
					<div className="empty-progress-icon">🎯</div>
					<h2>Your Fitness Journey Starts Here!</h2>
					<p>You haven't tracked any workouts yet. Start your first workout to see your progress!</p>
					<div className="empty-progress-actions">
						<button onClick={onBack} className="btn btn-primary btn-large">
							🏋️ Start First Workout
						</button>
					</div>
				</div>
			)}
			
			{stats && stats.totalWorkouts > 0 && (
				<>
					{/* Key Metrics Grid */}
					<div className="metrics-grid">
						<div className="metric-card primary">
							<div className="metric-icon">💪</div>
							<div className="metric-content">
								<div className="metric-value">{stats.totalWorkouts}</div>
								<div className="metric-label">Total Workouts</div>
								{stats.trends?.workouts && (
									<div className={`metric-trend ${stats.trends.workouts.direction}`}>
										{stats.trends.workouts.direction === 'up' ? '↑' : stats.trends.workouts.direction === 'down' ? '↓' : '→'}
										{Math.abs(stats.trends.workouts.change)}%
									</div>
								)}
							</div>
						</div>
						
						<div className="metric-card success">
							<div className="metric-icon">✅</div>
							<div className="metric-content">
								<div className="metric-value">{stats.averageCompletionRate}%</div>
								<div className="metric-label">Completion Rate</div>
								{stats.trends?.completionRate && (
									<div className={`metric-trend ${stats.trends.completionRate.direction}`}>
										{stats.trends.completionRate.direction === 'up' ? '↑' : stats.trends.completionRate.direction === 'down' ? '↓' : '→'}
										{Math.abs(stats.trends.completionRate.change)}%
									</div>
								)}
							</div>
						</div>
						
						<div className="metric-card warning">
							<div className="metric-icon">⚖️</div>
							<div className="metric-content">
								<div className="metric-value">{formatNumber(stats.totalVolume)}kg</div>
								<div className="metric-label">Total Volume</div>
								{stats.trends?.volume && (
									<div className={`metric-trend ${stats.trends.volume.direction}`}>
										{stats.trends.volume.direction === 'up' ? '↑' : stats.trends.volume.direction === 'down' ? '↓' : '→'}
										{Math.abs(stats.trends.volume.change)}%
									</div>
								)}
							</div>
						</div>
						
						<div className="metric-card info">
							<div className="metric-icon">⏱️</div>
							<div className="metric-content">
								<div className="metric-value">{Math.round(stats.totalDuration / 60)}h</div>
								<div className="metric-label">Total Duration</div>
								{stats.trends?.duration && (
									<div className={`metric-trend ${stats.trends.duration.direction}`}>
										{stats.trends.duration.direction === 'up' ? '↑' : stats.trends.duration.direction === 'down' ? '↓' : '→'}
										{Math.abs(stats.trends.duration.change)}%
									</div>
								)}
							</div>
						</div>
					</div>
					
					{/* Charts Section */}
					<div className="charts-container">
						<div className="charts-row">
							{/* Volume Progression */}
							{prepareVolumeChart() && prepareVolumeChart().datasets[0].data.length > 0 && (
								<div className="chart-card large">
									<div className="chart-header">
										<h3>📈 Volume Progression</h3>
										<span className="chart-subtitle">Training volume over time</span>
									</div>
									<div className="chart-wrapper">
										<Line 
											data={prepareVolumeChart()}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: { display: false },
													tooltip: {
														backgroundColor: 'rgba(0, 0, 0, 0.8)',
														padding: 12,
														borderRadius: 8,
														titleFont: { size: 14 },
														bodyFont: { size: 12 }
													}
												},
												scales: {
													y: { 
														beginAtZero: true,
														grid: {
															color: 'rgba(0, 0, 0, 0.05)'
														}
													},
													x: {
														grid: {
															display: false
														}
													}
												}
											}}
										/>
									</div>
								</div>
							)}
							
							{/* Muscle Group Breakdown */}
							{prepareMuscleGroupChart() && prepareMuscleGroupChart().datasets[0].data.length > 0 && (
								<div className="chart-card">
									<div className="chart-header">
										<h3>🎯 Muscle Groups</h3>
										<span className="chart-subtitle">Volume distribution</span>
									</div>
									<div className="chart-wrapper">
										<Bar 
											data={prepareMuscleGroupChart()}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: { display: false },
													tooltip: {
														backgroundColor: 'rgba(0, 0, 0, 0.8)',
														padding: 12,
														borderRadius: 8,
														titleFont: { size: 14 },
														bodyFont: { size: 12 }
													}
												},
												scales: {
													y: { 
														beginAtZero: true,
														grid: {
															color: 'rgba(0, 0, 0, 0.05)'
														}
													},
													x: {
														grid: {
															display: false
														}
													}
												}
											}}
										/>
									</div>
								</div>
							)}
						</div>
						
						<div className="charts-row">
							{/* Category Distribution */}
							{prepareCategoryDistribution() && prepareCategoryDistribution().datasets[0].data.length > 0 && (
								<div className="chart-card">
									<div className="chart-header">
										<h3>🏷️ Workout Types</h3>
										<span className="chart-subtitle">Category distribution</span>
									</div>
									<div className="chart-wrapper">
										<Doughnut 
											data={prepareCategoryDistribution()}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: { 
														position: 'bottom',
														labels: {
															padding: 10,
															usePointStyle: true,
															font: { size: 11 }
														}
													},
													tooltip: {
														backgroundColor: 'rgba(0, 0, 0, 0.8)',
														padding: 12,
														borderRadius: 8,
														titleFont: { size: 14 },
														bodyFont: { size: 12 }
													}
												}
											}}
										/>
									</div>
								</div>
							)}
							
							{/* Top Exercises */}
							{stats.topExercises && stats.topExercises.length > 0 && (
								<div className="chart-card">
									<div className="chart-header">
										<h3>🏆 Top Exercises</h3>
										<span className="chart-subtitle">Your most trained</span>
									</div>
									<div className="top-exercises-compact">
										{stats.topExercises.slice(0, 5).map((exercise, index) => (
											<div key={exercise.exerciseId} className="top-exercise-row">
												<span className="exercise-rank">#{index + 1}</span>
												<div className="exercise-details">
													<div className="exercise-name">{exercise.exerciseName}</div>
													<div className="exercise-meta">
														{exercise.muscleGroup} • {exercise.sessionCount} sessions
													</div>
												</div>
												<div className="exercise-volume">{formatNumber(exercise.totalVolume)}kg</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
					
					{/* Achievements & Records */}
					{(stats.recentAchievements?.length > 0 || allTimeStats?.personalBests) && (
						<div className="achievements-section">
							{/* Recent Achievements */}
							{stats.recentAchievements && stats.recentAchievements.length > 0 && (
								<div className="achievements-card">
									<div className="card-header">
										<h3>🏅 Recent Achievements</h3>
									</div>
									<div className="achievements-list">
										{stats.recentAchievements.map((achievement, index) => (
											<div key={index} className="achievement-item">
												<span className="achievement-icon">
													{achievement.type === 'personal_record' ? '🏆' : 
													 achievement.type === 'streak' ? '🔥' : '⭐'}
												</span>
												<div className="achievement-content">
													<div className="achievement-title">{achievement.title}</div>
													<div className="achievement-desc">{achievement.description}</div>
												</div>
												<div className="achievement-date">{formatDate(achievement.date)}</div>
											</div>
										))}
									</div>
								</div>
							)}
							
							{/* Personal Records */}
							{allTimeStats?.personalBests && (
								<div className="records-card">
									<div className="card-header">
										<h3>🏆 Personal Records</h3>
									</div>
									<div className="records-grid">
										{allTimeStats.personalBests.heaviestLift && (
											<div className="record-item">
												<div className="record-icon">🏋️</div>
												<div className="record-content">
													<div className="record-title">Heaviest Lift</div>
													<div className="record-exercise">{allTimeStats.personalBests.heaviestLift.exerciseName}</div>
													<div className="record-value">{allTimeStats.personalBests.heaviestLift.displayValue}</div>
												</div>
											</div>
										)}
										
										{allTimeStats.personalBests.highestVolume && (
											<div className="record-item">
												<div className="record-icon">⚖️</div>
												<div className="record-content">
													<div className="record-title">Highest Volume</div>
													<div className="record-exercise">{allTimeStats.personalBests.highestVolume.exerciseName}</div>
													<div className="record-value">{allTimeStats.personalBests.highestVolume.displayValue}</div>
												</div>
											</div>
										)}
										
										{allTimeStats.personalBests.mostReps && (
											<div className="record-item">
												<div className="record-icon">🔢</div>
												<div className="record-content">
													<div className="record-title">Most Reps</div>
													<div className="record-exercise">{allTimeStats.personalBests.mostReps.exerciseName}</div>
													<div className="record-value">{allTimeStats.personalBests.mostReps.displayValue}</div>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
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
	
	const periods = [
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' },
		{ value: 'year', label: 'This Year' }
	];
	
	const categories = [
		'Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Custom'
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
				throw new Error('Failed to fetch statistics');
			}
			
			const data = await response.json();
			setStats(data);
		} catch (error) {
			console.error('Error fetching stats:', error);
			setError('Failed to load statistics');
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
	
	// Chart data preparations
	const prepareVolumeChart = () => {
		if (!stats?.frequencyData) return null;
		
		const data = stats.frequencyData.filter(day => day.volume > 0);
		
		return {
			labels: data.map(d => formatDate(d.date)),
			datasets: [{
				label: 'Volume (kg)',
				data: data.map(d => d.volume),
				backgroundColor: 'rgba(59, 130, 246, 0.5)',
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 2,
				tension: 0.4
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
				)
			}]
		};
	};
	
	const prepareWorkoutFrequencyChart = () => {
		if (!stats?.frequencyData) return null;
		
		return {
			labels: stats.frequencyData.map(d => formatDate(d.date)),
			datasets: [{
				label: 'Workouts',
				data: stats.frequencyData.map(d => d.workouts),
				backgroundColor: stats.frequencyData.map(d => 
					d.workouts > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(107, 114, 128, 0.1)'
				),
				borderColor: stats.frequencyData.map(d => 
					d.workouts > 0 ? 'rgb(16, 185, 129)' : 'rgb(107, 114, 128)'
				),
				borderWidth: 1
			}]
		};
	};
	
	const prepareCategoryDistribution = () => {
		if (!stats?.muscleGroupStats) {
			// Return empty data if no muscle group stats
			return {
				labels: [],
				datasets: [{
					data: [],
					backgroundColor: []
				}]
			};
		}
		
		// Map muscle group stats to category data
		const categoryData = {};
		stats.muscleGroupStats.forEach(m => {
			categoryData[m.muscleGroup] = m.totalSessions || 0;
		});
		
		// Filter to only categories with data
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
				backgroundColor: activeCategories.map(cat => categoryColors[cat] || '#6b7280')
			}]
		};
	};
	
	if (loading && !stats) {
		return (
			<div className="user-profile loading">
				<div className="loading-spinner">Loading your progress...</div>
			</div>
		);
	}
	
	if (error) {
		return (
			<div className="user-profile error">
				<p>{error}</p>
				<button onClick={fetchStats} className="btn btn-primary">Retry</button>
				<button onClick={onBack} className="btn btn-secondary">Back</button>
			</div>
		);
	}
	
	return (
		<div className="user-profile">
			{/* Header */}
			<div className="profile-header">
				<button onClick={onBack} className="btn btn-secondary back-btn">
					← Back to Exercises
				</button>
				
				<div className="profile-title">
					<h1>Your Progress</h1>
					<div className="period-selector">
						{periods.map(period => (
							<button
								key={period.value}
								onClick={() => setSelectedPeriod(period.value)}
								className={`btn ${selectedPeriod === period.value ? 'btn-primary' : 'btn-secondary'}`}
							>
								{period.label}
							</button>
						))}
					</div>
				</div>
			</div>
			
			{/* Empty state when no workout data */}
			{!loading && (!stats || stats.totalWorkouts === 0) && (
				<div className="empty-state">
					<div className="empty-state-content">
						<h2>No Workout Data Yet</h2>
						<p>Start tracking your workouts to see your progress here!</p>
						<div className="empty-state-actions">
							<button onClick={onBack} className="btn btn-primary">
								Start Your First Workout
							</button>
						</div>
						<div className="empty-state-features">
							<h3>What you'll see once you start:</h3>
							<ul>
								<li>📊 Workout frequency and completion rates</li>
								<li>💪 Personal records and achievements</li>
								<li>📈 Progress trends over time</li>
								<li>🎯 Muscle group distribution</li>
							</ul>
						</div>
					</div>
				</div>
			)}
			
			{stats && stats.totalWorkouts > 0 && (
				<>
					{/* Key Stats */}
					<div className="stats-overview">
						<div className="stat-card">
							<h3>Total Workouts</h3>
							<p className="stat-value">{stats.totalWorkouts}</p>
							{stats.trends?.workouts && (
								<span className={`trend ${stats.trends.workouts.direction}`}>
									{stats.trends.workouts.direction === 'up' ? '↑' : stats.trends.workouts.direction === 'down' ? '↓' : '→'}
									{Math.abs(stats.trends.workouts.change)}%
								</span>
							)}
						</div>
						
						<div className="stat-card">
							<h3>Completion Rate</h3>
							<p className="stat-value">{stats.averageCompletionRate}%</p>
							{stats.trends?.completionRate && (
								<span className={`trend ${stats.trends.completionRate.direction}`}>
									{stats.trends.completionRate.direction === 'up' ? '↑' : stats.trends.completionRate.direction === 'down' ? '↓' : '→'}
									{Math.abs(stats.trends.completionRate.change)}%
								</span>
							)}
						</div>
						
						<div className="stat-card">
							<h3>Total Volume</h3>
							<p className="stat-value">{formatNumber(stats.totalVolume)}kg</p>
							{stats.trends?.volume && (
								<span className={`trend ${stats.trends.volume.direction}`}>
									{stats.trends.volume.direction === 'up' ? '↑' : stats.trends.volume.direction === 'down' ? '↓' : '→'}
									{Math.abs(stats.trends.volume.change)}%
								</span>
							)}
						</div>
						
						<div className="stat-card">
							<h3>Total Duration</h3>
							<p className="stat-value">{Math.round(stats.totalDuration / 60)}h</p>
							{stats.trends?.duration && (
								<span className={`trend ${stats.trends.duration.direction}`}>
									{stats.trends.duration.direction === 'up' ? '↑' : stats.trends.duration.direction === 'down' ? '↓' : '→'}
									{Math.abs(stats.trends.duration.change)}%
								</span>
							)}
						</div>
					</div>
					
					{/* Charts */}
					<div className="charts-grid">
						{/* Volume Progression */}
						{prepareVolumeChart() && prepareVolumeChart().datasets[0].data.length > 0 && (
							<div className="chart-container">
								<h3>Volume Progression</h3>
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
						)}
						
						{/* Muscle Group Breakdown */}
						{prepareMuscleGroupChart() && prepareMuscleGroupChart().datasets[0].data.length > 0 && (
							<div className="chart-container">
								<h3>Muscle Group Volume</h3>
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
						)}
						
						{/* Workout Frequency */}
						{prepareWorkoutFrequencyChart() && prepareWorkoutFrequencyChart().datasets[0].data.length > 0 && (
							<div className="chart-container">
								<h3>Workout Frequency</h3>
								<Bar 
									data={prepareWorkoutFrequencyChart()}
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
												ticks: {
													stepSize: 1
												},
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
						)}
						
						{/* Category Distribution */}
						{prepareCategoryDistribution() && prepareCategoryDistribution().datasets[0].data.length > 0 && (
							<div className="chart-container">
								<h3>Workout Categories</h3>
								<Doughnut 
									data={prepareCategoryDistribution()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { 
												position: 'bottom',
												labels: {
													padding: 15,
													usePointStyle: true,
													font: { size: 12 }
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
						)}
					</div>
					
					{/* Top Exercises */}
					{stats.topExercises && stats.topExercises.length > 0 && (
						<div className="top-exercises">
							<h3>Your Top Exercises</h3>
							<div className="exercises-list">
								{stats.topExercises.map((exercise, index) => (
									<div key={exercise.exerciseId} className="top-exercise-item">
										<span className="rank">#{index + 1}</span>
										<div className="exercise-info">
											<h4>{exercise.exerciseName}</h4>
											<p>{exercise.muscleGroup} • {exercise.sessionCount} sessions</p>
										</div>
										<div className="exercise-stats">
											<span>{formatNumber(exercise.totalVolume)}kg</span>
											<span>Best: {exercise.bestWeight.toFixed(1)}kg</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
					
					{/* Recent Achievements */}
					{stats.recentAchievements && stats.recentAchievements.length > 0 && (
						<div className="recent-achievements">
							<h3>Recent Achievements</h3>
							<div className="achievements-list">
								{stats.recentAchievements.map((achievement, index) => (
									<div key={index} className="achievement-item">
										<span className="achievement-icon">
											{achievement.type === 'personal_record' ? '🏆' : 
											 achievement.type === 'streak' ? '🔥' : '⭐'}
										</span>
										<div className="achievement-content">
											<h4>{achievement.title}</h4>
											<p>{achievement.description}</p>
											<small>{formatDate(achievement.date)}</small>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
					
					{/* Personal Records */}
					{allTimeStats?.personalBests && (
						<div className="personal-records">
							<h3>All-Time Personal Records</h3>
							<div className="records-grid">
								{allTimeStats.personalBests.heaviestLift && (
									<div className="record-item">
										<h4>Heaviest Lift</h4>
										<p>{allTimeStats.personalBests.heaviestLift.exerciseName}</p>
										<strong>{allTimeStats.personalBests.heaviestLift.displayValue}</strong>
									</div>
								)}
								
								{allTimeStats.personalBests.highestVolume && (
									<div className="record-item">
										<h4>Highest Volume</h4>
										<p>{allTimeStats.personalBests.highestVolume.exerciseName}</p>
										<strong>{allTimeStats.personalBests.highestVolume.displayValue}</strong>
									</div>
								)}
								
								{allTimeStats.personalBests.mostReps && (
									<div className="record-item">
										<h4>Most Reps</h4>
										<p>{allTimeStats.personalBests.mostReps.exerciseName}</p>
										<strong>{allTimeStats.personalBests.mostReps.displayValue}</strong>
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
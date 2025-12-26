import User from '../models/User.js';
import { EventRepository } from '../repositories/EventRepository.js';
import WorkoutSession from '../models/WorkoutSession.js';

export class AdminChartsService {
	constructor() {
		this.eventRepository = new EventRepository();
	}

	async getUserGrowthData(period = 'month') {
		try {
			const users = await User.find({}).sort({ createdAt: 1 });
			const now = new Date();
			let startDate = new Date();

			switch (period) {
				case 'week':
					startDate.setDate(now.getDate() - 7);
					break;
				case 'month':
					startDate.setMonth(now.getMonth() - 1);
					break;
				case 'quarter':
					startDate.setMonth(now.getMonth() - 3);
					break;
				case 'year':
					startDate.setFullYear(now.getFullYear() - 1);
					break;
				default:
					startDate.setMonth(now.getMonth() - 1);
			}

			const filteredUsers = users.filter(user => user.createdAt >= startDate);
			const data = [];
			let totalUsers = 0;

			// Group by day for simplicity
			const groupedData = {};
			filteredUsers.forEach(user => {
				const dateKey = user.createdAt.toISOString().split('T')[0];
				if (!groupedData[dateKey]) {
					groupedData[dateKey] = 0;
				}
				groupedData[dateKey]++;
			});

			// Sort dates and calculate cumulative totals
			const sortedDates = Object.keys(groupedData).sort();
			sortedDates.forEach(date => {
				totalUsers += groupedData[date];
				data.push({
					date,
					newUsers: groupedData[date],
					totalUsers
				});
			});

			const firstTotal = data.length > 0 ? data[0].totalUsers : 0;
			const lastTotal = data.length > 0 ? data[data.length - 1].totalUsers : 0;
			const growthRate = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal * 100).toFixed(1) : 0;

			return {
				period,
				data,
				growthRate: parseFloat(growthRate)
			};
		} catch (error) {
			console.error('Error in getUserGrowthData:', error);
			throw error;
		}
	}

	async getWorkoutFrequencyData(period = 'month') {
		try {
			const now = new Date();
			let startDate = new Date();

			switch (period) {
				case 'week':
					startDate.setDate(now.getDate() - 7);
					break;
				case 'month':
					startDate.setMonth(now.getMonth() - 1);
					break;
				case 'quarter':
					startDate.setMonth(now.getMonth() - 3);
					break;
				case 'year':
					startDate.setFullYear(now.getFullYear() - 1);
					break;
				default:
					startDate.setMonth(now.getMonth() - 1);
			}

			const sessions = await WorkoutSession.find({
				startTime: { $gte: startDate }
			}).sort({ startTime: 1 });

			// Daily frequency data
			const dailyFrequency = {};
			sessions.forEach(session => {
				const dateKey = session.startTime.toISOString().split('T')[0];
				if (!dailyFrequency[dateKey]) {
					dailyFrequency[dateKey] = { workouts: 0, users: new Set() };
				}
				dailyFrequency[dateKey].workouts++;
				dailyFrequency[dateKey].users.add(session.userId);
			});

			const dailyData = Object.keys(dailyFrequency)
				.sort()
				.map(date => ({
					date,
					workouts: dailyFrequency[date].workouts,
					users: dailyFrequency[date].users.size
				}));

			// Frequency distribution
			const userWorkoutCounts = {};
			sessions.forEach(session => {
				userWorkoutCounts[session.userId] = (userWorkoutCounts[session.userId] || 0) + 1;
			});

			const frequencyDistribution = {
				'0 workouts': 0,
				'1-2 workouts': 0,
				'3-4 workouts': 0,
				'5+ workouts': 0
			};

			const totalUsers = await User.countDocuments();
			const activeUsers = Object.keys(userWorkoutCounts).length;
			
			Object.values(userWorkoutCounts).forEach(count => {
				if (count <= 2) frequencyDistribution['1-2 workouts']++;
				else if (count <= 4) frequencyDistribution['3-4 workouts']++;
				else frequencyDistribution['5+ workouts']++;
			});

			frequencyDistribution['0 workouts'] = totalUsers - activeUsers;

			return {
				period,
				data: {
					dailyFrequency: dailyData,
					frequencyDistribution
				}
			};
		} catch (error) {
			console.error('Error in getWorkoutFrequencyData:', error);
			throw error;
		}
	}

	async getActivityHeatmapData(period = 'month') {
		try {
			const now = new Date();
			let startDate = new Date();

			switch (period) {
				case 'week':
					startDate.setDate(now.getDate() - 7);
					break;
				case 'month':
					startDate.setMonth(now.getMonth() - 1);
					break;
				case 'quarter':
					startDate.setMonth(now.getMonth() - 3);
					break;
				case 'year':
					startDate.setFullYear(now.getFullYear() - 1);
					break;
				default:
					startDate.setMonth(now.getMonth() - 1);
			}

			const events = await this.eventRepository.getEventsByDateRange(startDate, now);
			
			// If no events, return default structure
			if (!events || events.length === 0) {
				return {
					period,
					heatmapData: [],
					peakActivity: {
						hour: 0,
						day: 'Monday',
						totalPeakActivity: 0
					},
					activityTypes: {}
				};
			}

			const heatmapData = {};
			const activityTypes = {};

			events.forEach(event => {
				try {
					const eventDate = event.timestamp.toISOString().split('T')[0];
					const hour = event.timestamp.getHours();

					const key = `${eventDate}-${hour}`;
					if (!heatmapData[key]) {
						heatmapData[key] = { activity: 0, workouts: 0, users: new Set() };
					}

					heatmapData[key].activity++;
					heatmapData[key].users.add(event.userId);

					if (event.action === 'workout_session') {
						heatmapData[key].workouts++;
					}

					// Track activity types
					activityTypes[event.action] = (activityTypes[event.action] || 0) + 1;
				} catch (err) {
					console.error('Error processing event:', err, event);
				}
			});

			// Convert to array format for frontend
			const heatmapArray = Object.keys(heatmapData).map(key => {
				const [date, hourStr] = key.split('-');
				return {
					date,
					hour: parseInt(hourStr),
					activity: heatmapData[key].activity,
					workouts: heatmapData[key].workouts,
					users: heatmapData[key].users.size
				};
			});

			// Find peak activity
			const peakActivity = heatmapArray.length > 0 ? heatmapArray.reduce((max, current) => 
				current.activity > max.activity ? current : max, 
				{ activity: 0, hour: 0, date: '' }
			) : { activity: 0, hour: 0, date: '' };

			const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			const peakDay = peakActivity.date ? new Date(peakActivity.date).getDay() : 0;

			return {
				period,
				heatmapData: heatmapArray,
				peakActivity: {
					hour: peakActivity.hour,
					day: dayNames[peakDay],
					totalPeakActivity: peakActivity.activity
				},
				activityTypes
			};
		} catch (error) {
			console.error('Error in getActivityHeatmapData:', error);
			// Return default structure on error
			return {
				period,
				heatmapData: [],
				peakActivity: {
					hour: 0,
					day: 'Monday',
					totalPeakActivity: 0
				},
				activityTypes: {},
				error: error.message
			};
		}
	}

	async getUserTypeDistribution() {
		try {
			const users = await User.find({});
			const distribution = {
				totalUsers: users.length,
				motivatedUsers: 0,
				unmotivatedUsers: 0,
				expertUsers: 0,
				newUsers: 0
			};

			// For users without cached userType, classify them
			for (const user of users) {
				if (user.userType && user.userType !== 'NEW') {
					distribution[`${user.userType.toLowerCase()}Users`]++;
				} else {
					// Classify user based on their activity
					try {
						const events = await this.eventRepository.getUserEvents(user._id);
						const { UserProfileService } = await import('./UserProfileService.js');
						const userType = UserProfileService.classifyUser(events);
						
						switch (userType) {
							case 'MOTIVATED':
								distribution.motivatedUsers++;
								break;
							case 'UNMOTIVATED':
								distribution.unmotivatedUsers++;
								break;
							case 'EXPERT':
								distribution.expertUsers++;
								break;
							case 'NEW':
								distribution.newUsers++;
								break;
						}
					} catch (error) {
						distribution.newUsers++;
					}
				}
			}

			return distribution;
		} catch (error) {
			console.error('Error in getUserTypeDistribution:', error);
			throw error;
		}
	}
}
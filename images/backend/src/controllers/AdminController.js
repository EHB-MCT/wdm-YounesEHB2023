import { TokenService } from '../services/TokenService.js';
import { UserProfileService } from '../services/UserProfileService.js';
import { EventRepository } from '../repositories/EventRepository.js';
import { AdminChartsService } from '../services/AdminChartsService.js';

export class AdminController {
	constructor(userRepository) {
		this.userRepository = userRepository;
		this.eventRepository = new EventRepository();
		this.chartsService = new AdminChartsService();
	}

	async login(req, res, next) {
		try {
			const { password } = req.body;
			
			if (!password) {
				return res.status(400).json({ error: 'Password is required' });
			}

			// Simple hardcoded admin password check
			if (password !== 'admin') {
				return res.status(401).json({ error: 'Invalid admin password' });
			}

			// Generate admin token (no user ID needed for admin)
			const token = TokenService.generateAdminToken();
			
			console.log('🔐 Admin logged in successfully');
			res.json({ token, isAdmin: true });

		} catch (error) {
			next(error);
		}
	}

	async getUsers(req, res, next) {
		try {
			const users = await this.userRepository.getAll();
			res.json(users);
		} catch (error) {
			next(error);
		}
	}

	async getUserStats(req, res, next) {
		try {
			const users = await this.userRepository.getAll();
			const stats = {
				totalUsers: users.length,
				motivatedUsers: 0,
				unmotivatedUsers: 0,
				expertUsers: 0,
				newUsers: 0
			};

			// Classify each user
			for (const user of users) {
				try {
					const events = await this.eventRepository.getUserEvents(user.id);
					const userType = UserProfileService.classifyUser(events);
					
					switch (userType) {
						case 'MOTIVATED':
							stats.motivatedUsers++;
							break;
						case 'UNMOTIVATED':
							stats.unmotivatedUsers++;
							break;
						case 'EXPERT':
							stats.expertUsers++;
							break;
						case 'NEW':
							stats.newUsers++;
							break;
					}
				} catch (userError) {
					console.error(`Error processing user ${user.id}:`, userError);
					stats.newUsers++; // Default to NEW for error cases
				}
			}

			res.json(stats);
		} catch (error) {
			console.error('Error in getUserStats:', error);
			res.status(500).json({ error: 'Failed to get user statistics' });
		}
	}

	async getUserInsights(req, res, next) {
		try {
			const { userId } = req.params;
			const events = await this.eventRepository.getUserEvents(userId);
			const insights = UserProfileService.getUserInsights(events);
			
			res.json(insights);
		} catch (error) {
			console.error('Error in getUserInsights:', error);
			res.status(500).json({ error: 'Failed to get user insights' });
		}
	}

	async getAllUserInsights(req, res, next) {
		try {
			const users = await this.userRepository.getAll();
			const allInsights = [];

			for (const user of users) {
				try {
					const events = await this.eventRepository.getUserEvents(user.id);
					const insights = UserProfileService.getUserInsights(events);
					
					allInsights.push({
						id: user.id,
						name: user.name || 'Unknown',
						email: user.email || 'Unknown',
						...insights
					});
				} catch (userError) {
					console.error(`Error processing insights for user ${user.id}:`, userError);
					// Add basic user info even if insights fail
					allInsights.push({
						id: user.id,
						name: user.name || 'Unknown',
						email: user.email || 'Unknown',
						userType: 'NEW',
						metrics: { engagementScore: 0, completionRate: 0 },
						topExercises: [],
						insights: ['Unable to process user data']
					});
				}
			}

			// Sort by engagement score (highest first), handle missing metrics
			allInsights.sort((a, b) => 
				(b.metrics?.engagementScore || 0) - (a.metrics?.engagementScore || 0)
			);

			res.json(allInsights);
		} catch (error) {
			console.error('Error in getAllUserInsights:', error);
			res.status(500).json({ error: 'Failed to get user insights' });
		}
	}

	// Chart endpoints
	async getUserGrowthChart(req, res, next) {
		try {
			const { period = 'month' } = req.query;
			const data = await this.chartsService.getUserGrowthData(period);
			res.json(data);
		} catch (error) {
			console.error('Error in getUserGrowthChart:', error);
			res.status(500).json({ error: 'Failed to get user growth data' });
		}
	}

	async getWorkoutFrequencyChart(req, res, next) {
		try {
			const { period = 'month' } = req.query;
			const data = await this.chartsService.getWorkoutFrequencyData(period);
			res.json(data);
		} catch (error) {
			console.error('Error in getWorkoutFrequencyChart:', error);
			res.status(500).json({ error: 'Failed to get workout frequency data' });
		}
	}

	async getActivityHeatmapChart(req, res, next) {
		try {
			const { period = 'month' } = req.query;
			const data = await this.chartsService.getActivityHeatmapData(period);
			res.json(data);
		} catch (error) {
			console.error('Error in getActivityHeatmapChart:', error);
			res.status(500).json({ error: 'Failed to get activity heatmap data' });
		}
	}

	async getUserTypeDistributionChart(req, res, next) {
		try {
			const data = await this.chartsService.getUserTypeDistribution();
			res.json(data);
		} catch (error) {
			console.error('Error in getUserTypeDistributionChart:', error);
			res.status(500).json({ error: 'Failed to get user type distribution data' });
		}
	}

	// Enhanced user detail endpoints
	async getUserActivityTimeline(req, res, next) {
		try {
			const { userId } = req.params;
			const { limit = 10 } = req.query;
			
			const { WorkoutSession } = await import('../models/WorkoutSession.js');
			const sessions = await WorkoutSession.find({ userId })
				.sort({ startTime: -1 })
				.limit(parseInt(limit))
				.select('startTime endTime templateName category status completionRate totalVolume duration rating felt');
				
			res.json(sessions);
		} catch (error) {
			console.error('Error in getUserActivityTimeline:', error);
			res.status(500).json({ error: 'Failed to get user activity timeline' });
		}
	}

	async getUserPersonalRecords(req, res, next) {
		try {
			const { userId } = req.params;
			
			const { default: PersonalRecord } = await import('../models/PersonalRecord.js');
			const records = await PersonalRecord.find({ userId, isActive: true })
				.sort({ setDate: -1 })
				.populate('workoutSessionId', 'startTime templateName');
				
			res.json(records);
		} catch (error) {
			console.error('Error in getUserPersonalRecords:', error);
			res.status(500).json({ error: 'Failed to get user personal records' });
		}
	}

	async getUserWorkoutSummary(req, res, next) {
		try {
			const { userId } = req.params;
			const { period = 'all' } = req.query;
			
			const { UserStatsService } = await import('../services/UserStatsService.js');
			const userStatsService = new UserStatsService();
			
			const [currentStats, allTimeStats] = await Promise.all([
				userStatsService.getUserStats(userId, period),
				userStatsService.getAllTimeStats(userId)
			]);
			
			res.json({
				currentPeriod: currentStats,
				allTime: allTimeStats,
				period
			});
		} catch (error) {
			console.error('Error in getUserWorkoutSummary:', error);
			res.status(500).json({ error: 'Failed to get user workout summary' });
		}
	}
}
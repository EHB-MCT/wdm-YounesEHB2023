import { TokenService } from '../services/TokenService.js';
import { UserProfileService } from '../services/UserProfileService.js';
import { EventRepository } from '../repositories/EventRepository.js';

export class AdminController {
	constructor(userRepository) {
		this.userRepository = userRepository;
		this.eventRepository = new EventRepository();
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
}
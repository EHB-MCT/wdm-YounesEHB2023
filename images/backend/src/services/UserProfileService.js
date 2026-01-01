export class UserProfileService {
	// Exercise data for mapping IDs to names
	static EXERCISE_DATA = [
		{"id": 1, "name": "Barbell Biceps Curl"},
		{"id": 2, "name": "Bench Press"},
		{"id": 3, "name": "Chest Fly Machine"},
		{"id": 4, "name": "Deadlift"},
		{"id": 5, "name": "Dumbbell Biceps Curl"},
		{"id": 6, "name": "Dumbbell Lateral Raise"},
		{"id": 7, "name": "Dumbbell Shoulder Press"},
		{"id": 8, "name": "Hammer Curl"},
		{"id": 9, "name": "Incline Dumbbell Press"},
		{"id": 10, "name": "Lat Pulldown"},
		{"id": 11, "name": "Leg Press"},
		{"id": 12, "name": "Leg Raise"},
		{"id": 13, "name": "Lunge"},
		{"id": 14, "name": "Overhead Triceps Extension"},
		{"id": 15, "name": "Pull-up"},
		{"id": 16, "name": "Push-up"},
		{"id": 17, "name": "Romanian Deadlift"},
		{"id": 18, "name": "Seated Cable Row"},
		{"id": 19, "name": "Squat"},
		{"id": 20, "name": "Triceps Pushdown"}
	];

	// User classification thresholds
	static USER_TYPE_THRESHOLDS = {
		UNMOTIVATED: {
			minInteractions: 0,
			maxInteractions: 5,
			completionRate: 0.3,
			consistencyScore: 0.2
		},
		MOTIVATED: {
			minInteractions: 6,
			maxInteractions: 20,
			completionRate: 0.6,
			consistencyScore: 0.5
		},
		EXPERT: {
			minInteractions: 21,
			completionRate: 0.8,
			consistencyScore: 0.7
		}
	};

	/**
	 * Classify user based on their interaction data
	 * @param {Array} events - User interaction events
	 * @param {Object} userStats - User's basic statistics
	 * @returns {String} User type (UNMOTIVATED, MOTIVATED, EXPERT, NEW)
	 */
	static classifyUser(events, userStats = {}) {
		if (!events || events.length === 0) {
			return 'NEW';
		}

		// Calculate metrics
		const metrics = this.calculateUserMetrics(events);
		
		// Classify based on thresholds
		if (this.isUnmotivated(metrics)) {
			return 'UNMOTIVATED';
		}
		
		if (this.isExpert(metrics)) {
			return 'EXPERT';
		}
		
		if (this.isMotivated(metrics)) {
			return 'MOTIVATED';
		}

		return 'NEW';
	}

	/**
	 * Calculate user metrics from events
	 * @param {Array} events - User interaction events
	 * @returns {Object} Metrics object
	 */
	static calculateUserMetrics(events) {
		// Handle null/undefined events
		if (!events || !Array.isArray(events)) {
			events = [];
		}

		const totalInteractions = events.filter(e => e !== null && e !== undefined).length;
		const exerciseClicks = events.filter(e => e && e.action === 'exercise_click').length;
		const exerciseCompletes = events.filter(e => e && e.action === 'exercise_complete').length;
		const workoutSessions = events.filter(e => e && e.action === 'workout_session' && e.data && e.data.sessionType === 'start').length;
		const workoutCompletions = events.filter(e => e && e.action === 'workout_session' && e.data && e.data.sessionType === 'end').length;

		// Calculate completion rate
		const completionRate = exerciseClicks > 0 ? exerciseCompletes / exerciseClicks : 0;

		// Calculate workout completion rate
		const workoutCompletionRate = workoutSessions > 0 ? workoutCompletions / workoutSessions : 0;

		// Calculate consistency (based on recent activity pattern)
		const consistencyScore = this.calculateConsistencyScore(events);

		// Calculate engagement level
		const engagementScore = this.calculateEngagementScore(events);

		return {
			totalInteractions,
			exerciseClicks,
			exerciseCompletes,
			workoutSessions,
			workoutCompletions,
			completionRate,
			workoutCompletionRate,
			consistencyScore,
			engagementScore
		};
	}

	/**
	 * Calculate consistency score based on activity patterns
	 * @param {Array} events - User interaction events
	 * @returns {Number} Consistency score (0-1)
	 */
	static calculateConsistencyScore(events) {
		// Handle null/undefined events
		if (!events || !Array.isArray(events) || events.length === 0) {
			return 0;
		}

		// Group events by day
		const dailyActivity = {};
		events.forEach(event => {
			if (event) { // Additional safety check
				const date = new Date(event.timestamp || new Date()).toISOString().split('T')[0];
				dailyActivity[date] = (dailyActivity[date] || 0) + 1;
			}
		});

		const activeDays = Object.keys(dailyActivity).length;
		const totalDays = this.getDaysSinceFirstActivity(events);

		if (totalDays === 0) return 0;
		return Math.min(activeDays / totalDays, 1);
	}

	/**
	 * Calculate engagement score based on interaction diversity
	 * @param {Array} events - User interaction events
	 * @returns {Number} Engagement score (0-1)
	 */
	static calculateEngagementScore(events) {
		// Handle null/undefined events
		if (!events || !Array.isArray(events) || events.length === 0) {
			return 0;
		}

		const actionTypes = new Set();
		const exerciseIds = new Set();
		
		events.forEach(e => {
			if (e) { // Additional safety check
				if (e.action) actionTypes.add(e.action);
				if (e.data && e.data.exerciseId) exerciseIds.add(e.data.exerciseId);
			}
		});
		
		// Higher score for diverse interactions and exercise variety
		const actionScore = Math.min(actionTypes.size / 5, 1); // Normalize to max 5 action types
		const exerciseScore = Math.min(exerciseIds.size / 20, 1); // Normalize to max 20 different exercises
		
		return (actionScore + exerciseScore) / 2;
	}

	/**
	 * Check if user meets unmotivated criteria
	 */
	static isUnmotivated(metrics) {
		const thresholds = this.USER_TYPE_THRESHOLDS.UNMOTIVATED;
		return metrics.totalInteractions <= thresholds.maxInteractions &&
			   metrics.completionRate <= thresholds.completionRate &&
			   metrics.consistencyScore <= thresholds.consistencyScore;
	}

	/**
	 * Check if user meets motivated criteria
	 */
	static isMotivated(metrics) {
		const thresholds = this.USER_TYPE_THRESHOLDS.MOTIVATED;
		return metrics.totalInteractions >= thresholds.minInteractions &&
			   metrics.completionRate >= thresholds.completionRate &&
			   metrics.consistencyScore >= thresholds.consistencyScore;
	}

	/**
	 * Check if user meets expert criteria
	 */
	static isExpert(metrics) {
		const thresholds = this.USER_TYPE_THRESHOLDS.EXPERT;
		return metrics.totalInteractions >= thresholds.minInteractions &&
			   metrics.completionRate >= thresholds.completionRate &&
			   metrics.consistencyScore >= thresholds.consistencyScore;
	}

	/**
	 * Get user insights for admin dashboard
	 * @param {Array} events - User interaction events
	 * @returns {Object} User insights
	 */
	static getUserInsights(events) {
		// Handle null/undefined events
		if (!events || !Array.isArray(events)) {
			events = [];
		}

		const metrics = this.calculateUserMetrics(events);
		const userType = this.classifyUser(events);

		// Most popular exercises
		const exerciseFrequency = {};
		events.forEach(event => {
			if (event && event.data && event.data.exerciseId) {
				const id = event.data.exerciseId;
				exerciseFrequency[id] = (exerciseFrequency[id] || 0) + 1;
			}
		});

		const topExercises = Object.keys(exerciseFrequency).length > 0 
			? Object.entries(exerciseFrequency)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
				.map(([id, count]) => ({ 
					exerciseId: id, 
					exerciseName: this.getExerciseNameById(id),
					interactionCount: count 
				}))
			: [];

		// Activity patterns
		const hourlyActivity = new Array(24).fill(0);
		events.forEach(event => {
			if (event && event.timestamp) {
				try {
					const hour = new Date(event.timestamp).getHours();
					if (hour >= 0 && hour <= 23) {
						hourlyActivity[hour]++;
					}
				} catch (dateError) {
					console.error('Invalid timestamp for event:', event.timestamp);
				}
			}
		});

		const peakHour = hourlyActivity.length > 0 && Math.max(...hourlyActivity) > 0 
			? hourlyActivity.indexOf(Math.max(...hourlyActivity))
			: 12; // Default to noon

		return {
			userType,
			metrics,
			topExercises,
			peakHour,
			insights: this.generateInsights(userType, metrics)
		};
	}

	/**
	 * Generate textual insights based on user type and metrics
	 */
	static generateInsights(userType, metrics) {
		const insights = [];

		switch (userType) {
			case 'UNMOTIVATED':
				insights.push('Low engagement detected - consider sending motivational content');
				insights.push('Difficulty completing exercises - may need beginner guidance');
				break;
			case 'MOTIVATED':
				insights.push('Regular user with consistent workout patterns');
				insights.push('Good completion rate - ready for intermediate challenges');
				break;
			case 'EXPERT':
				insights.push('Highly engaged user - potential for advanced programs');
				insights.push('Excellent consistency - could be community advocate');
				break;
			case 'NEW':
				insights.push('New user - needs onboarding and welcome content');
				break;
		}

		if (metrics.consistencyScore > 0.8) {
			insights.push('Very consistent workout schedule');
		}

		if (metrics.engagementScore > 0.7) {
			insights.push('Explores variety of exercises');
		}

		return insights;
	}

	/**
	 * Helper method to calculate days since first activity
	 */
	static getDaysSinceFirstActivity(events) {
		if (!events || events.length === 0) return 0;
		
		const firstEvent = events.reduce((earliest, event) => {
			const eventDate = new Date(event.timestamp || new Date());
			const earliestDate = new Date(earliest.timestamp || new Date());
			return eventDate < earliestDate ? event : earliest;
		});

		const firstDate = new Date(firstEvent.timestamp || new Date());
		const now = new Date();
		const diffTime = Math.abs(now - firstDate);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	/**
	 * Get exercise name by ID
	 * @param {Number} exerciseId - Exercise ID
	 * @returns {String} Exercise name or fallback text
	 */
	static getExerciseNameById(exerciseId) {
		const exercise = this.EXERCISE_DATA.find(ex => ex.id === parseInt(exerciseId));
		return exercise ? exercise.name : `Exercise ${exerciseId}`;
	}
}
import WorkoutSession from "../models/WorkoutSession.js";
import PersonalRecord from "../models/PersonalRecord.js";
import WorkoutTemplate from "../models/WorkoutTemplate.js";
import { UtilsService } from "./UtilsService.js";

export class UserStatsService {
  async getUserStats(userId, period = 'month', referenceDate = null) {
    try {
      const dateRange = UtilsService.getDateRange(period, referenceDate);
      
      // Get workout sessions for the period
      const sessions = await WorkoutSession.find({
        userId,
        startTime: { $gte: dateRange.startDate, $lte: dateRange.endDate }
      }).sort({ startTime: -1 });
      
      // Calculate basic stats
      const stats = UtilsService.calculateWorkoutStats(sessions);
      
      // Get muscle group breakdown
      const muscleGroupStats = this.calculateMuscleGroupStats(sessions);
      
      // Get personal records achieved in this period
      const newPRs = await PersonalRecord.find({
        userId,
        setDate: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        isActive: true
      }).sort({ setDate: -1 });
      
      // Calculate trends (compare with previous period)
      const trends = await this.calculateTrends(userId, period, referenceDate);
      
      // Get workout frequency by day/week
      const frequencyData = this.calculateFrequencyData(sessions, period);
      
      // Get top exercises
      const topExercises = this.getTopExercises(sessions, 5);
      
      // Get recent achievements
      const recentAchievements = await this.getRecentAchievements(userId, period);
      
      return {
        period,
        dateRange,
        ...stats,
        muscleGroupStats,
        newPersonalRecords: newPRs,
        trends,
        frequencyData,
        topExercises,
        recentAchievements
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw error;
    }
  }
  
  calculateMuscleGroupStats(sessions) {
    const muscleStats = {};
    
    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        if (exercise.completedSets.length === 0) return;
        
        const muscleGroup = exercise.muscleGroup;
        if (!muscleStats[muscleGroup]) {
          muscleStats[muscleGroup] = {
            muscleGroup,
            totalVolume: 0,
            totalSets: 0,
            totalReps: 0,
            sessionCount: 0,
            averageWeight: 0,
            exerciseCount: 0
          };
        }
        
        const exerciseStats = UtilsService.calculateExerciseStats([session], exercise.exerciseId);
        
        muscleStats[muscleGroup].totalVolume += exerciseStats.totalVolume;
        muscleStats[muscleGroup].totalSets += exerciseStats.totalSets;
        muscleStats[muscleGroup].totalReps += exerciseStats.allSets.reduce((sum, set) => sum + set.reps, 0);
        muscleStats[muscleGroup].exerciseCount += 1;
        
        // Track session count for this muscle group
        if (!session.muscleGroupsTracked) {
          session.muscleGroupsTracked = [];
        }
        
        if (!session.muscleGroupsTracked.includes(muscleGroup)) {
          session.muscleGroupsTracked.push(muscleGroup);
          muscleStats[muscleGroup].sessionCount += 1;
        }
      });
    });
    
    // Calculate average weights and convert to array format
    return Object.values(muscleStats)
      .map(stat => ({
        ...stat,
        averageWeight: stat.totalSets > 0 ? Math.round((stat.totalVolume / stat.totalReps) * 10) / 10 : 0
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }
  
  async calculateTrends(userId, period, referenceDate = null) {
    try {
      const currentRange = UtilsService.getDateRange(period, referenceDate);
      
      // Calculate previous period date range
      const previousDate = new Date(currentRange.startDate);
      previousDate.setDate(previousDate.getDate() - 7); // for week comparison
      
      const previousRange = UtilsService.getDateRange(period, previousDate);
      
      // Get data for both periods
      const [currentSessions, previousSessions] = await Promise.all([
        WorkoutSession.find({
          userId,
          startTime: { $gte: currentRange.startDate, $lte: currentRange.endDate }
        }),
        WorkoutSession.find({
          userId,
          startTime: { $gte: previousRange.startDate, $lte: previousRange.endDate }
        })
      ]);
      
      const currentStats = UtilsService.calculateWorkoutStats(currentSessions);
      const previousStats = UtilsService.calculateWorkoutStats(previousSessions);
      
      return {
        workouts: this.calculateTrend(currentStats.totalWorkouts, previousStats.totalWorkouts),
        duration: this.calculateTrend(currentStats.totalDuration, previousStats.totalDuration),
        volume: this.calculateTrend(currentStats.totalVolume, previousStats.totalVolume),
        completionRate: this.calculateTrend(currentStats.averageCompletionRate, previousStats.averageCompletionRate),
        frequency: this.calculateTrend(currentStats.workoutFrequency, previousStats.workoutFrequency)
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {};
    }
  }
  
  calculateTrend(current, previous) {
    if (previous === 0) {
      return {
        current,
        previous,
        change: current > 0 ? 100 : 0,
        direction: current > 0 ? 'up' : 'neutral'
      };
    }
    
    const change = ((current - previous) / previous) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return {
      current,
      previous,
      change: Math.round(change * 10) / 10,
      direction
    };
  }
  
  calculateFrequencyData(sessions, period) {
    if (sessions.length === 0) return [];
    
    const frequencyData = [];
    const { startDate, endDate } = UtilsService.getDateRange(period);
    
    // Create date range based on period
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const workoutsOnDay = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      frequencyData.push({
        date: new Date(currentDate),
        workouts: workoutsOnDay.length,
        volume: workoutsOnDay.reduce((sum, s) => sum + (s.totalVolume || 0), 0),
        duration: workoutsOnDay.reduce((sum, s) => sum + (s.duration || 0), 0)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return frequencyData;
  }
  
  getTopExercises(sessions, limit = 5) {
    const exerciseStats = {};
    
    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        if (exercise.completedSets.length === 0) return;
        
        const exerciseId = exercise.exerciseId;
        if (!exerciseStats[exerciseId]) {
          exerciseStats[exerciseId] = {
            exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            totalVolume: 0,
            totalSets: 0,
            sessionCount: 0,
            bestWeight: 0,
            bestReps: 0
          };
        }
        
        exercise.completedSets.forEach(set => {
          const weightInKg = UtilsService.convertToKg(set.weight, set.weightUnit || 'kg');
          exerciseStats[exerciseId].totalVolume += set.reps * weightInKg;
          exerciseStats[exerciseId].totalSets += 1;
          
          if (weightInKg > exerciseStats[exerciseId].bestWeight) {
            exerciseStats[exerciseId].bestWeight = weightInKg;
          }
          
          if (set.reps > exerciseStats[exerciseId].bestReps) {
            exerciseStats[exerciseId].bestReps = set.reps;
          }
        });
        
        exerciseStats[exerciseId].sessionCount += 1;
      });
    });
    
    return Object.values(exerciseStats)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);
  }
  
  async getRecentAchievements(userId, period = 'month') {
    try {
      const dateRange = UtilsService.getDateRange(period);
      
      const newPRs = await PersonalRecord.find({
        userId,
        setDate: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        isActive: true
      }).sort({ setDate: -1 });
      
      const achievements = [];
      
      newPRs.forEach(pr => {
        achievements.push({
          type: 'personal_record',
          title: `New ${pr.recordType} PR!`,
          description: `${pr.exerciseName}: ${this.formatPRValue(pr)}`,
          date: pr.setDate,
          exerciseId: pr.exerciseId,
          recordType: pr.recordType
        });
      });
      
      // Add streak achievements
      const sessions = await WorkoutSession.find({
        userId,
        status: 'completed',
        startTime: { $gte: dateRange.startDate, $lte: dateRange.endDate }
      }).sort({ startTime: 1 });
      
      const streak = this.calculateWorkoutStreak(sessions);
      if (streak >= 7) {
        achievements.push({
          type: 'streak',
          title: `${streak}-Day Streak!`,
          description: `Completed workouts for ${streak} consecutive days`,
          date: new Date(),
          value: streak
        });
      }
      
      return achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }
  
  formatPRValue(pr) {
    switch (pr.recordType) {
      case 'weight':
        return `${pr.value.toFixed(1)}kg`;
      case 'reps':
        return `${pr.value} reps`;
      case 'volume':
        return `${pr.value.toFixed(1)}kg total`;
      case 'duration':
        return `${pr.value} min`;
      default:
        return pr.value.toString();
    }
  }
  
  calculateWorkoutStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    let currentStreak = 0;
    let lastDate = null;
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        currentStreak = 1;
        lastDate = sessionDate;
      } else {
        const dayDiff = Math.floor((sessionDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak += 1;
          lastDate = sessionDate;
        } else if (dayDiff > 1) {
          // Break in streak
          currentStreak = 1;
          lastDate = sessionDate;
        }
        // dayDiff === 0 means multiple workouts same day, doesn't affect streak
      }
    });
    
    return currentStreak;
  }
  
  // Get user's all-time statistics
  async getAllTimeStats(userId) {
    try {
      const [allSessions, allPRs, templates] = await Promise.all([
        WorkoutSession.find({ userId }).sort({ startTime: -1 }),
        PersonalRecord.find({ userId, isActive: true }).sort({ value: -1 }),
        WorkoutTemplate.find({ userId })
      ]);
      
      const stats = UtilsService.calculateWorkoutStats(allSessions);
      
      // Get personal bests
      const weightPRs = allPRs.filter(pr => pr.recordType === 'weight');
      const volumePRs = allPRs.filter(pr => pr.recordType === 'volume');
      const repsPRs = allPRs.filter(pr => pr.recordType === 'reps');
      
      return {
        ...stats,
        totalTemplates: templates.length,
        personalBests: {
          heaviestLift: weightPRs[0],
          highestVolume: volumePRs[0],
          mostReps: repsPRs[0]
        },
        favoriteExercises: this.getTopExercises(allSessions, 3),
        trainingSince: allSessions.length > 0 ? allSessions[allSessions.length - 1].startTime : null
      };
    } catch (error) {
      console.error('Error getting all-time stats:', error);
      throw error;
    }
  }
}
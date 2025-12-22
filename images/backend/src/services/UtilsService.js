export class UtilsService {
  // Weight conversion utilities
  static convertWeight(value, from, to) {
    if (from === to) return value;
    
    if (from === 'kg' && to === 'lbs') {
      return Math.round(value * 2.20462 * 10) / 10; // round to 1 decimal
    }
    
    if (from === 'lbs' && to === 'kg') {
      return Math.round((value / 2.20462) * 10) / 10; // round to 1 decimal
    }
    
    throw new Error('Invalid conversion units');
  }
  
  static convertToKg(value, unit) {
    if (unit === 'kg') return value;
    if (unit === 'lbs') return value / 2.20462;
    throw new Error('Invalid unit');
  }
  
  static convertToLbs(value, unit) {
    if (unit === 'lbs') return value;
    if (unit === 'kg') return value * 2.20462;
    throw new Error('Invalid unit');
  }
  
  // Date utilities for statistics
  static getDateRange(period, referenceDate = new Date()) {
    const date = new Date(referenceDate);
    date.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    
    switch (period) {
      case 'week':
        const dayOfWeek = date.getDay();
        startDate = new Date(date);
        startDate.setDate(date.getDate() - dayOfWeek);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'month':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'year':
        startDate = new Date(date.getFullYear(), 0, 1);
        endDate = new Date(date.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      default:
        throw new Error('Invalid period. Use: week, month, year');
    }
    
    return { startDate, endDate };
  }
  
  // Format duration utilities
  static formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }
  
  static formatSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Statistics calculations
  static calculateWorkoutStats(sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalDuration: 0,
        totalVolume: 0,
        averageCompletionRate: 0,
        mostRecentWorkout: null,
        longestWorkout: null,
        strongestWorkout: null,
        workoutFrequency: 0
      };
    }
    
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
    const averageCompletionRate = sessions.reduce((sum, s) => sum + (s.completionRate || 0), 0) / sessions.length;
    
    const longestWorkout = sessions.reduce((max, s) => 
      (s.duration || 0) > (max.duration || 0) ? s : max, sessions[0]);
    
    const strongestWorkout = sessions.reduce((max, s) => 
      (s.totalVolume || 0) > (max.totalVolume || 0) ? s : max, sessions[0]);
    
    // Calculate workout frequency (workouts per week)
    if (completedSessions.length > 0) {
      const firstWorkout = new Date(Math.min(...completedSessions.map(s => new Date(s.startTime))));
      const weeksSinceFirst = Math.max(1, Math.ceil((Date.now() - firstWorkout) / (7 * 24 * 60 * 60 * 1000)));
      const workoutFrequency = completedSessions.length / weeksSinceFirst;
    }
    
    return {
      totalWorkouts: sessions.length,
      completedWorkouts: completedSessions.length,
      totalDuration,
      totalVolume,
      averageCompletionRate: Math.round(averageCompletionRate),
      mostRecentWorkout: sessions[0], // assuming sorted by date descending
      longestWorkout,
      strongestWorkout,
      workoutFrequency: workoutFrequency || 0
    };
  }
  
  // Exercise statistics
  static calculateExerciseStats(sessions, exerciseId = null) {
    let allExercises = [];
    
    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        if (exerciseId && exercise.exerciseId !== exerciseId) return;
        if (exercise.completedSets.length === 0) return;
        
        exercise.completedSets.forEach(set => {
          allExercises.push({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            reps: set.reps,
            weight: this.convertToKg(set.weight, set.weightUnit || 'kg'),
            weightUnit: 'kg',
            date: set.timestamp || session.startTime,
            sessionId: session._id,
            sessionDate: session.startTime
          });
        });
      });
    });
    
    if (allExercises.length === 0) {
      return {
        totalSets: 0,
        totalVolume: 0,
        averageWeight: 0,
        averageReps: 0,
        heaviestSet: null,
        mostReps: null,
        volumeProgression: [],
        frequency: 0
      };
    }
    
    const totalVolume = allExercises.reduce((sum, ex) => sum + (ex.reps * ex.weight), 0);
    const averageWeight = allExercises.reduce((sum, ex) => sum + ex.weight, 0) / allExercises.length;
    const averageReps = allExercises.reduce((sum, ex) => sum + ex.reps, 0) / allExercises.length;
    
    const heaviestSet = allExercises.reduce((max, ex) => 
      ex.weight > max.weight ? ex : max, allExercises[0]);
    
    const mostReps = allExercises.reduce((max, ex) => 
      ex.reps > max.reps ? ex : max, allExercises[0]);
    
    // Calculate frequency (sessions where this exercise was performed)
    const uniqueSessions = [...new Set(allExercises.map(ex => ex.sessionId))].length;
    
    return {
      totalSets: allExercises.length,
      totalVolume: Math.round(totalVolume),
      averageWeight: Math.round(averageWeight * 10) / 10,
      averageReps: Math.round(averageReps),
      heaviestSet,
      mostReps,
      frequency: uniqueSessions,
      allSets: allExercises.sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  }
  
  // Template suggestions
  static suggestTemplateCategory(exercises) {
    const muscleGroups = exercises.map(ex => ex.muscleGroup);
    const groupCounts = {};
    
    muscleGroups.forEach(group => {
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    });
    
    const totalExercises = exercises.length;
    const topGroup = Object.entries(groupCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (!topGroup) return 'Custom';
    
    const [group, count] = topGroup;
    
    // If one muscle group dominates, suggest that category
    if (count / totalExercises >= 0.7) {
      if (group.toLowerCase().includes('chest') || 
          group.toLowerCase().includes('back') || 
          group.toLowerCase().includes('shoulders') || 
          group.toLowerCase().includes('arms')) {
        return 'Upper Body';
      }
      
      if (group.toLowerCase().includes('legs') || 
          group.toLowerCase().includes('glutes')) {
        return 'Lower Body';
      }
      
      if (group.toLowerCase().includes('core') || 
          group.toLowerCase().includes('abs')) {
        return 'Core';
      }
    }
    
    // If exercises span both upper and lower body
    const upperBodyGroups = ['chest', 'back', 'shoulders', 'arms'];
    const lowerBodyGroups = ['legs', 'glutes', 'quads', 'hamstrings', 'calves'];
    
    const hasUpper = muscleGroups.some(g => 
      upperBodyGroups.some(ub => g.toLowerCase().includes(ub)));
    const hasLower = muscleGroups.some(g => 
      lowerBodyGroups.some(lb => g.toLowerCase().includes(lb)));
    
    if (hasUpper && hasLower) {
      return 'Full Body';
    }
    
    return 'Custom';
  }
}
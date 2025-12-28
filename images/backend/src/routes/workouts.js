import express from "express";
import { WorkoutController } from "../controllers/WorkoutController.js";
import { UserStatsService } from "../services/UserStatsService.js";
import PersonalRecord from "../models/PersonalRecord.js";
import WorkoutSession from "../models/WorkoutSession.js";
import WorkoutTemplate from "../models/WorkoutTemplate.js";
import { UtilsService } from "../services/UtilsService.js";
import auth from "../middleware/auth.js";
import { errorHandler } from "../middleware/errorHandler.js";

const router = express.Router();
const workoutController = new WorkoutController();
const userStatsService = new UserStatsService();

// TEMPLATE ROUTES

// Get all workout templates for the user
router.get("/templates", auth, workoutController.getWorkoutTemplates.bind(workoutController));

// Get a specific workout template
router.get("/templates/:id", auth, workoutController.getWorkoutTemplate.bind(workoutController));

// Create a new workout template
router.post("/template", auth, workoutController.createWorkoutTemplate.bind(workoutController));

// Update a workout template
router.put("/template/:id", auth, workoutController.updateWorkoutTemplate.bind(workoutController));

// Delete a workout template
router.delete("/template/:id", auth, workoutController.deleteWorkoutTemplate.bind(workoutController));

// SESSION ROUTES

// Get all workout sessions for the user
router.get("/sessions", auth, workoutController.getWorkoutSessions.bind(workoutController));

// Get a specific workout session
router.get("/sessions/:id", auth, workoutController.getWorkoutSession.bind(workoutController));

// Start a new workout session
router.post("/session", auth, workoutController.startWorkoutSession.bind(workoutController));

// Log exercise set in a workout session
router.put("/session/:sessionId/exercise", auth, workoutController.logExerciseSet.bind(workoutController));

// Complete a workout session
router.post("/session/:sessionId/complete", auth, workoutController.completeWorkoutSession.bind(workoutController));

// Abandon a workout session
router.post("/session/:sessionId/abandon", auth, workoutController.abandonWorkoutSession.bind(workoutController));

// USER STATISTICS ROUTES

// Get user statistics for a specific period
router.get("/stats/:period", auth, async (req, res, next) => {
  try {
    const { period } = req.params;
    const { date } = req.query;
    const userId = req.user._id;

    if (!['week', 'month', 'year'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Use: week, month, year' });
    }

    const referenceDate = date ? new Date(date) : new Date();
    const stats = await userStatsService.getUserStats(userId, period, referenceDate);

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get all-time statistics
router.get("/stats/all-time", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const stats = await userStatsService.getAllTimeStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// PERSONAL RECORDS ROUTES

// Get user's personal records
router.get("/records", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { exerciseId } = req.query;
    
    const records = await PersonalRecord.getUserPRs(userId, exerciseId);
    
    // Group by exercise and record type
    const groupedRecords = {};
    
    records.forEach(record => {
      const key = record.exerciseId;
      if (!groupedRecords[key]) {
        groupedRecords[key] = {
          exerciseId: record.exerciseId,
          exerciseName: record.exerciseName,
          muscleGroup: record.muscleGroup,
          weight: null,
          reps: null,
          volume: null,
          duration: null
        };
      }
      
      groupedRecords[key][record.recordType] = {
        value: record.value,
        displayValue: record.displayValue,
        date: record.setDate,
        workoutSessionId: record.workoutSessionId
      };
    });
    
    res.json({
      records: Object.values(groupedRecords),
      total: Object.keys(groupedRecords).length
    });
  } catch (error) {
    next(error);
  }
});

// Get personal records for a specific exercise
router.get("/records/:exerciseId", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { exerciseId } = req.params;
    
    const records = await PersonalRecord.getUserPRs(userId, exerciseId);
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

// UTILITY ROUTES

// Weight conversion utility
router.get("/utils/convert", auth, (req, res) => {
  try {
    const { value, from, to } = req.query;
    
    if (!value || !from || !to) {
      return res.status(400).json({ error: 'value, from, and to parameters are required' });
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return res.status(400).json({ error: 'Invalid value' });
    }
    
    if (!['kg', 'lbs'].includes(from) || !['kg', 'lbs'].includes(to)) {
      return res.status(400).json({ error: 'Units must be kg or lbs' });
    }
    
    const convertedValue = UtilsService.convertWeight(numValue, from, to);
    
    res.json({
      original: { value: numValue, unit: from },
      converted: { value: convertedValue, unit: to },
      conversion: `${numValue}${from} = ${convertedValue}${to}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export workout data for admin PDF generation
router.get("/export/:userId", auth, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId } = req.params;
    const { period = 'year', format = 'json' } = req.query;
    
    const [sessions, templates, records, stats] = await Promise.all([
      WorkoutSession.find({ userId }).sort({ startTime: -1 }),
      WorkoutTemplate.find({ userId }).sort({ createdAt: -1 }),
      PersonalRecord.find({ userId, isActive: true }).sort({ value: -1 }),
      userStatsService.getAllTimeStats(userId)
    ]);
    
    const exportData = {
      userId,
      exportDate: new Date(),
      period,
      summary: stats,
      templates: templates.map(t => ({
        name: t.name,
        category: t.category,
        exerciseCount: t.exercises.length,
        totalUses: t.totalUses,
        createdAt: t.createdAt
      })),
      sessions: sessions.map(s => ({
        templateName: s.templateName,
        category: s.category,
        status: s.status,
        duration: s.duration,
        totalVolume: s.totalVolume,
        completionRate: s.completionRate,
        startTime: s.startTime,
        endTime: s.endTime,
        exercisesCompleted: s.exercises.filter(ex => ex.completedSets.length > 0).length
      })),
      personalRecords: records.map(r => ({
        exerciseName: r.exerciseName,
        recordType: r.recordType,
        value: r.displayValue,
        date: r.setDate
      }))
    };
    
    if (format === 'json') {
      res.json(exportData);
    } else {
      // For future CSV/PDF export
      res.status(400).json({ error: 'Only JSON format is currently supported' });
    }
  } catch (error) {
    next(error);
  }
});

// Get workout suggestions based on user history
router.get("/suggestions", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'template' } = req.query;
    
    if (type === 'template') {
      // Suggest template based on frequently trained muscle groups
      const recentSessions = await WorkoutSession.find({ 
        userId, 
        status: 'completed',
        startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
      }).sort({ startTime: -1 }).limit(10);
      
      const muscleFrequency = {};
      
      recentSessions.forEach(session => {
        session.exercises.forEach(exercise => {
          if (exercise.completedSets.length > 0) {
            muscleFrequency[exercise.muscleGroup] = (muscleFrequency[exercise.muscleGroup] || 0) + 1;
          }
        });
      });
      
      const topMuscleGroup = Object.entries(muscleFrequency)
        .sort(([,a], [,b]) => b - a)[0];
      
      const suggestions = {
        frequency: Object.entries(muscleFrequency)
          .sort(([,a], [,b]) => b - a)
          .map(([group, count]) => ({ muscleGroup: group, count })),
        recommendedCategory: topMuscleGroup ? UtilsService.suggestTemplateCategory([{ muscleGroup: topMuscleGroup[0] }]) : 'Full Body'
      };
      
      res.json(suggestions);
    } else {
      res.status(400).json({ error: 'Invalid suggestion type' });
    }
  } catch (error) {
    next(error);
  }
});

// Export current user's workout data
router.get("/export/user", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period = 'year', format = 'json' } = req.query;
    
    const [sessions, templates, records, stats] = await Promise.all([
      WorkoutSession.find({ userId }).sort({ startTime: -1 }),
      WorkoutTemplate.find({ userId }).sort({ createdAt: -1 }),
      PersonalRecord.find({ userId, isActive: true }).sort({ value: -1 }),
      userStatsService.getAllTimeStats(userId)
    ]);
    
    const exportData = {
      userId,
      exportDate: new Date(),
      period,
      summary: stats,
      templates: templates.map(t => ({
        name: t.name,
        category: t.category,
        exerciseCount: t.exercises.length,
        totalUses: t.totalUses,
        createdAt: t.createdAt
      })),
      sessions: sessions.map(s => ({
        date: s.startTime,
        duration: s.duration,
        exercises: s.exercises.length,
        volume: s.totalVolume,
        completed: s.isCompleted
      })),
      personalRecords: records
    };
    
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

export default router;
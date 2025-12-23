import WorkoutTemplate from "../models/WorkoutTemplate.js";
import WorkoutSession from "../models/WorkoutSession.js";
import PersonalRecord from "../models/PersonalRecord.js";

export class WorkoutController {
  // TEMPLATE MANAGEMENT
  
  async getWorkoutTemplates(req, res, next) {
    try {
      const { category, page = 1, limit = 10 } = req.query;
      const userId = req.user._id;
      
      const query = { userId };
      if (category && category !== 'all') {
        query.category = category;
      }
      
      const templates = await WorkoutTemplate.find(query)
        .sort({ lastUsed: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await WorkoutTemplate.countDocuments(query);
      
      res.json({
        templates,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getWorkoutTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const template = await WorkoutTemplate.findOne({ _id: id, userId });
      
      if (!template) {
        return res.status(404).json({ error: 'Workout template not found' });
      }
      
      res.json(template);
    } catch (error) {
      next(error);
    }
  }
  
  async createWorkoutTemplate(req, res, next) {
    try {
      const { name, description, category, exercises, tags } = req.body;
      const userId = req.user._id;
      
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }
      
      if (!exercises || exercises.length === 0) {
        return res.status(400).json({ error: 'At least one exercise is required' });
      }
      
      // Add order to exercises
      const orderedExercises = exercises.map((exercise, index) => ({
        ...exercise,
        order: index + 1,
        targetSets: exercise.targetSets || 3,
        targetReps: exercise.targetReps || "10",
        targetWeight: exercise.targetWeight || 0,
        restTime: exercise.restTime || 60,
        exerciseRestTime: exercise.exerciseRestTime || 90
      }));
      
      const template = new WorkoutTemplate({
        userId,
        name: name.trim(),
        description: description?.trim() || '',
        category,
        exercises: orderedExercises,
        tags: tags || []
      });
      
      await template.save();
      
      res.status(201).json(template);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
  
  async updateWorkoutTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, category, exercises, tags } = req.body;
      const userId = req.user._id;
      
      const template = await WorkoutTemplate.findOne({ _id: id, userId });
      
      if (!template) {
        return res.status(404).json({ error: 'Workout template not found' });
      }
      
      // Update fields
      if (name) template.name = name.trim();
      if (description !== undefined) template.description = description.trim();
      if (category) template.category = category;
      if (tags) template.tags = tags;
      
      if (exercises && exercises.length > 0) {
        const orderedExercises = exercises.map((exercise, index) => ({
          ...exercise,
          order: index + 1
        }));
        template.exercises = orderedExercises;
      }
      
      await template.save();
      
      res.json(template);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
  
  async deleteWorkoutTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const template = await WorkoutTemplate.findOne({ _id: id, userId });
      
      if (!template) {
        return res.status(404).json({ error: 'Workout template not found' });
      }
      
      // Check if template is being used by any sessions
      const sessionCount = await WorkoutSession.countDocuments({ 
        workoutTemplateId: id,
        userId 
      });
      
      if (sessionCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete template that has been used in workout sessions',
          sessionCount 
        });
      }
      
      await WorkoutTemplate.deleteOne({ _id: id });
      
      res.json({ message: 'Workout template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  
  // SESSION MANAGEMENT
  
  async getWorkoutSessions(req, res, next) {
    try {
      const { status, category, page = 1, limit = 20 } = req.query;
      const userId = req.user._id;
      
      const query = { userId };
      if (status && status !== 'all') {
        query.status = status;
      }
      if (category && category !== 'all') {
        query.category = category;
      }
      
      const sessions = await WorkoutSession.find(query)
        .sort({ startTime: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await WorkoutSession.countDocuments(query);
      
      res.json({
        sessions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getWorkoutSession(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const session = await WorkoutSession.findOne({ _id: id, userId })
        .populate('workoutTemplateId', 'name category');
      
      if (!session) {
        return res.status(404).json({ error: 'Workout session not found' });
      }
      
      res.json(session);
    } catch (error) {
      next(error);
    }
  }
  
  async startWorkoutSession(req, res, next) {
    try {
      const { workoutTemplateId, customName, customCategory } = req.body;
      const userId = req.user._id;
      
      let template;
      let templateName;
      let category;
      let exercises = [];
      
      if (workoutTemplateId) {
        // Start from existing template
        template = await WorkoutTemplate.findOne({ _id: workoutTemplateId, userId });
        
        if (!template) {
          return res.status(404).json({ error: 'Workout template not found' });
        }
        
        templateName = template.name;
        category = template.category;
        exercises = template.exercises.map(ex => ({
          ...ex,
          completedSets: [],
          exerciseCompleted: false,
          startTime: null,
          endTime: null
        }));
        
        // Mark template as used
        await template.markAsUsed();
      } else {
        // Custom workout - exercises should be provided
        templateName = customName || 'Custom Workout';
        category = customCategory || 'Custom';
        
        // Allow empty custom workouts - users can add exercises during the session
        
        exercises = req.body.exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          targetSets: ex.targetSets || 3,
          targetReps: ex.targetReps || "10",
          targetWeight: ex.targetWeight || 0,
          completedSets: [],
          exerciseCompleted: false,
          startTime: null,
          endTime: null,
          order: index + 1
        }));
      }
      
      const session = new WorkoutSession({
        workoutTemplateId,
        userId,
        templateName,
        category,
        exercises,
        status: 'in_progress'
      });
      
      await session.save();
      
      // If started from template, populate template info
      if (template) {
        await session.populate('workoutTemplateId', 'name category');
      }
      
      res.status(201).json(session);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
  
  async logExerciseSet(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { exerciseId, setNumber, reps, weight, weightUnit = 'kg', notes } = req.body;
      const userId = req.user._id;
      
      console.log('Logging exercise set:', { sessionId, exerciseId, setNumber, reps, weight, userId });
      
      const session = await WorkoutSession.findOne({ _id: sessionId, userId });
      
      if (!session) {
        console.error('Session not found:', sessionId);
        return res.status(404).json({ error: 'Workout session not found' });
      }
      
      if (session.status !== 'in_progress') {
        console.error('Session not in progress:', session.status);
        return res.status(400).json({ error: 'Cannot log sets for completed or abandoned workout' });
      }
      
      const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
      
      if (!exercise) {
        console.error('Exercise not found in session:', exerciseId);
        console.log('Available exercises:', session.exercises.map(ex => ex.exerciseId));
        return res.status(404).json({ error: 'Exercise not found in this workout session' });
      }
      
      // Ensure completedSets is initialized
      if (!exercise.completedSets) {
        exercise.completedSets = [];
      }
      
      // Add or update the set
      const existingSetIndex = exercise.completedSets.findIndex(
        set => set.setNumber === setNumber
      );
      
      const set = {
        setNumber,
        reps,
        weight,
        weightUnit,
        notes: notes || '',
        timestamp: new Date()
      };
      
      console.log('Adding set to exercise:', set);
      
      if (existingSetIndex >= 0) {
        exercise.completedSets[existingSetIndex] = set;
        console.log('Updated existing set at index:', existingSetIndex);
      } else {
        exercise.completedSets.push(set);
        console.log('Added new set. Total sets:', exercise.completedSets.length);
      }
      
      // Set exercise start time if first set
      if (exercise.completedSets.length === 1 && !exercise.startTime) {
        exercise.startTime = new Date();
        console.log('Set exercise start time');
      }
      
      console.log('Saving session...');
      await session.save();
      console.log('Session saved successfully');
      
      // Check for personal records
      const exerciseData = req.body;
      exerciseData.userId = userId;
      exerciseData.exerciseName = exercise.exerciseName;
      exerciseData.muscleGroup = exercise.muscleGroup;
      exerciseData.workoutSessionId = sessionId;
      
      console.log('Checking for personal records...');
      const newPRs = await PersonalRecord.checkAndUpdatePR(exerciseData);
      console.log('Personal records found:', newPRs.length);
      
      res.json({ 
        session,
        newPersonalRecords: newPRs.length > 0,
        records: newPRs
      });
    } catch (error) {
      console.error('Error in logExerciseSet:', error);
      next(error);
    }
  }
  
  async completeWorkoutSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { rating, felt, notes } = req.body;
      const userId = req.user._id;
      
      console.log('Complete workout request:', { sessionId, userId, rating, felt, notes });
      
      const session = await WorkoutSession.findOne({ _id: sessionId, userId });
      
      if (!session) {
        console.error('Session not found for completion:', sessionId);
        return res.status(404).json({ error: 'Workout session not found' });
      }
      
      if (session.status !== 'in_progress') {
        console.error('Session not in progress for completion:', session.status);
        return res.status(400).json({ error: 'Workout is already completed or abandoned' });
      }
      
      // Ensure all exercises have completedSets arrays
      session.exercises.forEach(exercise => {
        if (!exercise.completedSets) {
          exercise.completedSets = [];
        }
      });
      
      // Update completion fields
      if (rating !== undefined) session.rating = rating;
      if (felt) session.felt = felt;
      if (notes !== undefined) session.notes = notes;
      
      console.log('Completing workout session:', sessionId);
      console.log('Session exercises count:', session.exercises.length);
      console.log('Total sets planned:', session.totalSetsPlanned);
      console.log('Total sets completed:', session.totalSetsCompleted);
      
      await session.completeWorkout();
      
      console.log('Workout completed successfully');
      res.json(session);
    } catch (error) {
      console.error('Error completing workout session:', error);
      next(error);
    }
  }
  
  async abandonWorkoutSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { notes } = req.body;
      const userId = req.user._id;
      
      console.log('Abandon workout request:', { sessionId, userId, notes });
      
      const session = await WorkoutSession.findOne({ _id: sessionId, userId });
      
      if (!session) {
        console.error('Session not found for abandonment:', sessionId);
        return res.status(404).json({ error: 'Workout session not found' });
      }
      
      if (session.status !== 'in_progress') {
        console.error('Session not in progress for abandonment:', session.status);
        return res.status(400).json({ error: 'Workout is already completed or abandoned' });
      }
      
      // Ensure all exercises have completedSets arrays
      session.exercises.forEach(exercise => {
        if (!exercise.completedSets) {
          exercise.completedSets = [];
        }
      });
      
      if (notes) session.notes = notes;
      
      console.log('Abandoning workout session...');
      await session.abandonWorkout();
      console.log('Workout abandoned successfully');
      
      res.json(session);
    } catch (error) {
      console.error('Error abandoning workout session:', error);
      next(error);
    }
  }
}
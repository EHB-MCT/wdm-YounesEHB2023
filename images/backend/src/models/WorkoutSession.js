import mongoose from "mongoose";

const completedSetSchema = new mongoose.Schema({
	setNumber: { type: Number, required: true },
	reps: { type: Number, required: true, min: 0 },
	weight: { type: Number, required: true, min: 0 }, // kg
	weightUnit: { type: String, required: true, enum: ['kg', 'lbs'], default: 'kg' },
	completed: { type: Boolean, required: true, default: true },
	timestamp: { type: Date, default: Date.now },
	notes: { type: String, trim: true, maxlength: 200 }
});

const exerciseInSessionSchema = new mongoose.Schema({
	exerciseId: { type: String, required: true },
	exerciseName: { type: String, required: true },
	muscleGroup: { type: String, required: true },
	targetSets: { type: Number, required: true },
	targetReps: { type: String, required: true },
	targetWeight: { type: Number, required: true }, // kg
	completedSets: [completedSetSchema],
	exerciseCompleted: { type: Boolean, required: true, default: false },
	startTime: { type: Date },
	endTime: { type: Date },
	order: { type: Number, required: true }
});

const workoutSessionSchema = new mongoose.Schema({
	workoutTemplateId: { type: String, required: false }, // null if custom workout
	userId: { type: String, required: true, ref: 'User' },
	templateName: { type: String, required: true, trim: true },
	category: { 
		type: String, 
		required: true,
		enum: ['Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Custom'],
		default: 'Custom'
	},
	exercises: [exerciseInSessionSchema],
	status: { 
		type: String, 
		required: true, 
		enum: ['in_progress', 'completed', 'abandoned'], 
		default: 'in_progress' 
	},
	startTime: { type: Date, required: true, default: Date.now },
	endTime: { type: Date },
	duration: { type: Number, default: 0 }, // minutes
	totalVolume: { type: Number, default: 0 }, // total reps × weight in kg
	completionRate: { type: Number, default: 0 }, // percentage
	totalSetsCompleted: { type: Number, default: 0 },
	totalSetsPlanned: { type: Number, default: 0 },
	notes: { type: String, trim: true, maxlength: 1000 },
	rating: { type: Number, min: 1, max: 5 }, // workout difficulty rating
	felt: { type: String, enum: ['easy', 'moderate', 'hard', 'extreme'] }
});

// Indexes for performance
workoutSessionSchema.index({ userId: 1, startTime: -1 });
workoutSessionSchema.index({ workoutTemplateId: 1, startTime: -1 });
workoutSessionSchema.index({ userId: 1, status: 1 });
workoutSessionSchema.index({ userId: 1, category: 1 });

// Pre-save middleware to calculate duration and completion rate
workoutSessionSchema.pre('save', function(next) {
	try {
		if (this.endTime && this.startTime) {
			this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
		}
		
		// Calculate total sets planned and completed - ensure targetSets exists
		this.totalSetsPlanned = this.exercises.reduce((sum, ex) => sum + (ex.targetSets || 3), 0);
		this.totalSetsCompleted = this.exercises.reduce((sum, ex) => sum + (ex.completedSets ? ex.completedSets.length : 0), 0);
		
		// Calculate completion rate
		this.completionRate = this.totalSetsPlanned > 0 
			? Math.round((this.totalSetsCompleted / this.totalSetsPlanned) * 100) 
			: 0;
		
		// Calculate total volume (reps × weight in kg)
		this.totalVolume = this.exercises.reduce((total, exercise) => {
			if (!exercise.completedSets || !Array.isArray(exercise.completedSets)) return total;
			const exerciseVolume = exercise.completedSets.reduce((exTotal, set) => {
				// Convert to kg for consistent calculation
				const weightInKg = set.weightUnit === 'lbs' ? set.weight / 2.20462 : set.weight;
				return exTotal + (set.reps * weightInKg);
			}, 0);
			return total + exerciseVolume;
		}, 0);
		
		next();
	} catch (error) {
		console.error('Error in pre-save middleware:', error);
		next(error);
	}
});

// Method to complete workout
workoutSessionSchema.methods.completeWorkout = function() {
	this.status = 'completed';
	this.endTime = new Date();
	
	// Mark any incomplete exercises as not completed
	this.exercises.forEach(exercise => {
		if (!exercise.completedSets.length) {
			exercise.exerciseCompleted = false;
		} else {
			exercise.exerciseCompleted = exercise.completedSets.length >= exercise.targetSets;
			if (!exercise.endTime) {
				exercise.endTime = new Date();
			}
		}
	});
	
	return this.save();
};

// Method to abandon workout
workoutSessionSchema.methods.abandonWorkout = function() {
	this.status = 'abandoned';
	this.endTime = new Date();
	return this.save();
};

// Virtual for workout performance rating
workoutSessionSchema.virtual('performanceRating').get(function() {
	if (this.completionRate >= 90) return 'Excellent';
	if (this.completionRate >= 75) return 'Good';
	if (this.completionRate >= 50) return 'Fair';
	return 'Poor';
});

workoutSessionSchema.set('toJSON', { virtuals: true });

export default mongoose.model("WorkoutSession", workoutSessionSchema);
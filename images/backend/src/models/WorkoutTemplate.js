import mongoose from "mongoose";

const exerciseInTemplateSchema = new mongoose.Schema({
	exerciseId: { type: String, required: true },
	exerciseName: { type: String, required: true },
	muscleGroup: { type: String, required: true },
	targetSets: { type: Number, required: true, default: 3 },
	targetReps: { type: String, required: true, default: "10" }, // "8-12" or "10"
	targetWeight: { type: Number, required: true, default: 0 }, // stored in kg
	restTime: { type: Number, required: true, default: 60 }, // seconds between sets
	exerciseRestTime: { type: Number, required: true, default: 90 }, // seconds between exercises
	order: { type: Number, required: true }, // exercise order in template
});

const workoutTemplateSchema = new mongoose.Schema({
	userId: { type: String, required: true, ref: 'User' },
	name: { type: String, required: true, trim: true, maxlength: 100 },
	description: { type: String, trim: true, maxlength: 500 },
	category: { 
		type: String, 
		required: true,
		enum: ['Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Custom'],
		default: 'Custom'
	},
	exercises: [exerciseInTemplateSchema],
	createdAt: { type: Date, default: Date.now },
	lastUsed: { type: Date, default: Date.now },
	totalUses: { type: Number, default: 0 },
	isPublic: { type: Boolean, default: false },
	tags: [{ type: String, trim: true, maxlength: 30 }] // e.g., ["strength", "beginner", "home"]
});

// Indexes for performance
workoutTemplateSchema.index({ userId: 1, createdAt: -1 });
workoutTemplateSchema.index({ userId: 1, lastUsed: -1 });
workoutTemplateSchema.index({ userId: 1, category: 1 });

// Update lastUsed and increment totalUses
workoutTemplateSchema.methods.markAsUsed = function() {
	this.lastUsed = new Date();
	this.totalUses += 1;
	return this.save();
};

// Virtual for template difficulty based on exercises
workoutTemplateSchema.virtual('difficulty').get(function() {
	if (!this.exercises.length) return 'Beginner';
	
	const avgWeight = this.exercises.reduce((sum, ex) => sum + ex.targetWeight, 0) / this.exercises.length;
	const avgSets = this.exercises.reduce((sum, ex) => sum + ex.targetSets, 0) / this.exercises.length;
	
	if (avgWeight > 50 && avgSets > 3) return 'Advanced';
	if (avgWeight > 20 || avgSets > 3) return 'Intermediate';
	return 'Beginner';
});

workoutTemplateSchema.set('toJSON', { virtuals: true });

export default mongoose.model("WorkoutTemplate", workoutTemplateSchema);
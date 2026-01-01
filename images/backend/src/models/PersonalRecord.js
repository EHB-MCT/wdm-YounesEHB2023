import mongoose from "mongoose";

const personalRecordSchema = new mongoose.Schema({
	userId: { type: String, required: true, ref: 'User' },
	exerciseId: { type: String, required: true },
	exerciseName: { type: String, required: true, trim: true },
	muscleGroup: { type: String, required: true },
	recordType: { 
		type: String, 
		required: true,
		enum: ['weight', 'reps', 'volume', 'duration']
	},
	value: { type: Number, required: true, min: 0 },
	weightUnit: { type: String, required: true, enum: ['kg', 'lbs'], default: 'kg' },
	setDate: { type: Date, required: true, default: Date.now },
	workoutSessionId: { type: String, required: true, ref: 'WorkoutSession' },
	notes: { type: String, trim: true, maxlength: 200 },
	repRange: { type: String, trim: true }, // for weight PRs: "8-12 reps"
	isActive: { type: Boolean, default: true } // to hide old PRs
});

// Compound indexes for performance
personalRecordSchema.index({ userId: 1, exerciseId: 1, recordType: 1, value: -1 });
personalRecordSchema.index({ userId: 1, recordType: 1, setDate: -1 });
personalRecordSchema.index({ exerciseId: 1, recordType: 1, value: -1 });

// Static method to check and create new personal record
personalRecordSchema.statics.checkAndUpdatePR = async function(recordData) {
	const {
		userId,
		exerciseId,
		exerciseName,
		muscleGroup,
		workoutSessionId,
		weight,
		reps,
		weightUnit = 'kg',
		notes = '',
		repRange = ''
	} = recordData;

	// Convert to kg for consistent comparison
	const weightInKg = weightUnit === 'lbs' ? weight / 2.20462 : weight;
	const volumeInKg = weightInKg * reps;

	const newRecords = [];

	// Check weight PR (heaviest weight lifted)
	const currentWeightPR = await this.findOne({
		userId,
		exerciseId,
		recordType: 'weight',
		isActive: true
	}).sort({ value: -1 });

	if (!currentWeightPR || weightInKg > currentWeightPR.value) {
		// Deactivate old weight PR
		if (currentWeightPR) {
			currentWeightPR.isActive = false;
			await currentWeightPR.save();
		}

		newRecords.push({
			userId,
			exerciseId,
			exerciseName,
			muscleGroup,
			recordType: 'weight',
			value: weightInKg,
			weightUnit: 'kg', // always store in kg
			workoutSessionId,
			notes: notes || `${weight}${weightUnit} ${repRange || reps} reps`,
			repRange
		});
	}

	// Check reps PR (most reps at this weight)
	const currentRepsPR = await this.findOne({
		userId,
		exerciseId,
		recordType: 'reps',
		isActive: true
	}).sort({ value: -1 });

	if (!currentRepsPR || reps > currentRepsPR.value || 
		(currentRepsPR.value === reps && weightInKg > currentRepsPR.weight)) {
		
		// Deactivate old reps PR
		if (currentRepsPR) {
			currentRepsPR.isActive = false;
			await currentRepsPR.save();
		}

		newRecords.push({
			userId,
			exerciseId,
			exerciseName,
			muscleGroup,
			recordType: 'reps',
			value: reps,
			weightUnit: 'kg',
			workoutSessionId,
			notes: notes || `${reps} reps at ${weight}${weightUnit}`,
			repRange
		});
	}

	// Check volume PR (highest volume)
	const currentVolumePR = await this.findOne({
		userId,
		exerciseId,
		recordType: 'volume',
		isActive: true
	}).sort({ value: -1 });

	if (!currentVolumePR || volumeInKg > currentVolumePR.value) {
		// Deactivate old volume PR
		if (currentVolumePR) {
			currentVolumePR.isActive = false;
			await currentVolumePR.save();
		}

		newRecords.push({
			userId,
			exerciseId,
			exerciseName,
			muscleGroup,
			recordType: 'volume',
			value: volumeInKg,
			weightUnit: 'kg',
			workoutSessionId,
			notes: notes || `${volumeInKg.toFixed(1)}kg total volume`,
			repRange
		});
	}

	// Create new records if any
	if (newRecords.length > 0) {
		const createdRecords = await this.insertMany(newRecords);
		return createdRecords;
	}

	return [];
};

// Static method to get user's personal records
personalRecordSchema.statics.getUserPRs = async function(userId, exerciseId = null) {
	const query = { userId, isActive: true };
	if (exerciseId) {
		query.exerciseId = exerciseId;
	}

	return await this.find(query)
		.sort({ exerciseId: 1, recordType: 1, value: -1 })
		.populate('workoutSessionId', 'startTime templateName');
};

// Virtual for display value with proper units
personalRecordSchema.virtual('displayValue').get(function() {
	switch (this.recordType) {
		case 'weight':
			return `${this.value.toFixed(1)}kg`;
		case 'reps':
			return `${this.value} reps`;
		case 'volume':
			return `${this.value.toFixed(1)}kg`;
		case 'duration':
			return `${this.value} min`;
		default:
			return this.value.toString();
	}
});

personalRecordSchema.set('toJSON', { virtuals: true });

export default mongoose.model("PersonalRecord", personalRecordSchema);
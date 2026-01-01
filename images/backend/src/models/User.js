import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	lastLogin: { type: Date },
	isActive: { type: Boolean, default: true },
	userType: { 
		type: String, 
		enum: ['NEW', 'UNMOTIVATED', 'MOTIVATED', 'EXPERT'],
		default: 'NEW' 
	}
});

export default mongoose.model("User", UserSchema);

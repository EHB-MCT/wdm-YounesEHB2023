import mongoose from "mongoose";

const userEventSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	userEmail: { type: String },
	action: { type: String, required: true },
	data: { type: mongoose.Schema.Types.Mixed },
	ip: String,
	userAgent: String,
	timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("UserEvent", userEventSchema);

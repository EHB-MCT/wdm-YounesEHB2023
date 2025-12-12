import dotenv from "dotenv";

dotenv.config();
console.log(process.env.MONGO_URI);
export const config = {
	port: process.env.PORT || 5000,
	mongoUri: process.env.MONGO_URI,
	jwtSecret: process.env.JWT_SECRET || "supersecret",
	nodeEnv: process.env.NODE_ENV || "development",
};

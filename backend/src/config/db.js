import { ENV } from "./env.js";
import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

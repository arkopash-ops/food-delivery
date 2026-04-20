import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("DB Connected.");
    } catch (error) {
        console.error(`DB Connection Error: ${error}`);
        process.exit(1);
    }
};

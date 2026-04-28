import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionOptions = {};

    if (process.env.MONGODB_DB_NAME) {
      connectionOptions.dbName = process.env.MONGODB_DB_NAME;
    }

    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      connectionOptions
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    (process.env.DB_USER && process.env.DB_PASSWORD
      ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.di78vms.mongodb.net/abuildhomesDB?retryWrites=true&w=majority`
      : null);

  if (!uri) {
    console.warn("⚠️ MongoDB URI / credentials missing in environment variables.");
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      family: 4, // Force IPv4 for reliable Atlas connection in cloud/serverless environments
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully via Mongoose: ${conn.connection.host}`);
    return conn.connection;
  } catch (err: any) {
    isConnected = false;
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDB;

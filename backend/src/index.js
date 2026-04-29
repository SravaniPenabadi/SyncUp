
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import groupRoutes from "./routes/group.route.js";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
import notificationRoutes from "./routes/notification.route.js";

console.log("Current Directory:", process.cwd());
console.log("MongoDB URI:", process.env.MONGODB_URI);

const PORT = process.env.PORT;
const __dirname = path.resolve();

// CORS must come first
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  // });
}

server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});
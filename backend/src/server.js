import express from 'express'
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.routes.js';
import commentRoutes from './routes/comment.route.js';
import notificationRoutes from './routes/Notification.route.js';
import cors from 'cors';
import { arcjetMiddleware } from './middleware/arcjet.middleware.js';
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use(express.json());
app.use(cors())
app.use(clerkMiddleware())
app.use(arcjetMiddleware)

app.use("/api/users", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/comment", commentRoutes)
app.use("/api/notification", notificationRoutes)

// Global error handling middleware
app.use((err, req, res,next) => {
  console.error("unhandled error:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error"
  })
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`Server is running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
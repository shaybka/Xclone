import express from 'express'
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import userRoutes from './routes/user.route.js';
import cors from 'cors';
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use(express.json());
app.use(cors())
app.use(clerkMiddleware())

app.use("/api/users",userRoutes)

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
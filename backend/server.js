import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express';

import aiDetectionRoutes from './src/routes/aiDetectionRoutes.js';
import textGenerationRoutes from './src/routes/textGenerationRoutes.js';
import classificationRoutes from './src/routes/classificationRoutes.js';
import assistantRoutes from './src/routes/assistantRoutes.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const clerkKey = process.env.CLERK_SECRET_KEY?.trim();
if (clerkKey && clerkKey !== 'dummy') {
  app.use(clerkMiddleware());
} else {
  
}

app.use('/api/ai', aiDetectionRoutes);
app.use('/api/generate', textGenerationRoutes);
app.use('/api/classify', classificationRoutes);
app.use('/api/assistant', assistantRoutes);


app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
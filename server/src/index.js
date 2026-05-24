import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// routes
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(cors());
app.use(express.json());
//* routes
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URL, {});

mongoose.connection.on('connected', () => {
  console.log("Mongo atlas up");
});

mongoose.connection.on('error', err => {
  console.error("Mongo atlas connection error:", err);
})

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is healthy and running!'
    });
});

app.get("/api/hello", (_, res) => {
  res.json({
    message: "Hello from backend"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// routes
import authRoutes from './routes/authRoutes.js';
import modulesRoutes from './routes/modulesRoutes.js';
import perfilesRoutes from './routes/perfilesRoutes.js';
import jornalerosRoutes from './routes/jornalerosRoutes.js';
import jornaleroActividadesRoutes from './routes/jornaleroActividadesRoutes.js';
import viaticosRoutes from './routes/viaticosRoutes.js';
import ordenesCompraRoutes from './routes/ordenesCompraRoutes.js';
import conceptosViaticoRoutes from './routes/conceptosViaticoRoutes.js';

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
//* routes
app.use("/api/auth", authRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/perfiles", perfilesRoutes);
app.use("/api/jornaleros", jornalerosRoutes);
app.use("/api/jornalero-actividades", jornaleroActividadesRoutes);
app.use("/api/viaticos", viaticosRoutes);
app.use("/api/ordenes-compra", ordenesCompraRoutes);
app.use("/api/conceptos-viatico", conceptosViaticoRoutes);

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
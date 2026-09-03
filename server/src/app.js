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
import conceptosActividadRoutes from './routes/conceptosActividadRoutes.js';

dotenv.config();

/**
 * Conexión a MongoDB reutilizable entre invocaciones.
 *
 * En un entorno serverless (Vercel) cada request puede reutilizar el mismo
 * proceso; cachear la promesa de conexión evita abrir múltiples conexiones a
 * MongoDB Atlas y agotar el pool.
 *
 * @type {{ conn: import('mongoose').Mongoose | null, promise: Promise<import('mongoose').Mongoose> | null }}
 */
let cached = globalThis.__mongooseCache;
if (!cached) {
  cached = globalThis.__mongooseCache = { conn: null, promise: null };
}

/**
 * Abre (o reutiliza) la conexión a MongoDB usando la variable de entorno MONGO_URL.
 * @returns {Promise<import('mongoose').Mongoose>} instancia de mongoose ya conectada.
 */
export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL no está definida');
    }

    cached.promise = mongoose
      .connect(process.env.MONGO_URL, { bufferCommands: false })
      .then((mongooseInstance) => {
        console.log('Mongo atlas up');
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('Mongo atlas connection error:', error);
    throw error;
  }

  return cached.conn;
}

const app = express();

app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

/**
 * Garantiza que exista conexión a MongoDB antes de atender cualquier ruta /api.
 */
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ message: 'Base de datos no disponible' });
  }
});

//* routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/jornaleros', jornalerosRoutes);
app.use('/api/jornalero-actividades', jornaleroActividadesRoutes);
app.use('/api/viaticos', viaticosRoutes);
app.use('/api/ordenes-compra', ordenesCompraRoutes);
app.use('/api/conceptos-viatico', conceptosViaticoRoutes);
app.use('/api/conceptos-actividad', conceptosActividadRoutes);

/**
 * Endpoint de salud para verificar que el servidor responde.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is healthy and running!',
  });
});

/**
 * Endpoint de prueba simple.
 */
app.get('/api/hello', (_, res) => {
  res.json({
    message: 'Hello from backend',
  });
});

export default app;

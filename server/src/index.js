import app, { connectDB } from './app.js';

const PORT = process.env.PORT || 5000;

/**
 * Arranca el servidor HTTP para desarrollo local.
 * En Vercel el punto de entrada es /api/index.js y no se ejecuta este archivo.
 */
connectDB().catch((error) => {
  console.error('No se pudo conectar a MongoDB al iniciar:', error);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

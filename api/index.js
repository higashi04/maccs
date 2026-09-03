import app from '../server/src/app.js';

/**
 * Punto de entrada serverless para Vercel.
 * Todas las peticiones a /api/* se reenvían a la app de Express.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default function handler(req, res) {
  return app(req, res);
}

# Despliegue en Vercel

Este repo se despliega como **un solo proyecto de Vercel**: el frontend (React/Vite)
se sirve como sitio estático y el backend (Express) corre como una serverless
function en la misma URL bajo `/api/*`. Al ser mismo-origen no hay que configurar
CORS ni cookies `SameSite=None`.

## Estructura relevante

| Archivo | Función |
| --- | --- |
| `pnpm-workspace.yaml` | Define el workspace pnpm (`client`, `server`). |
| `vercel.json` | Build del cliente, carpeta de salida, rewrites SPA + `/api`. |
| `api/index.js` | Entrada serverless: reenvía todo a la app de Express. |
| `server/src/app.js` | App de Express + `connectDB()` con conexión cacheada. |
| `server/src/index.js` | Solo para desarrollo local (`app.listen`). |

## Pasos para desplegar

1. **Importar el repo en Vercel** (New Project → GitHub → `higashi04/maccs`).
2. En *Framework Preset* dejar **Other** (lo fuerza `vercel.json`).
   No hace falta tocar Build Command ni Output Directory: los define `vercel.json`.
3. **Variables de entorno** (Project Settings → Environment Variables), para
   *Production* y *Preview*:

   | Variable | Valor |
   | --- | --- |
   | `MONGO_URL` | Cadena de conexión de MongoDB Atlas |
   | `JWT_SECRET` | Valor largo y aleatorio |
   | `JWT_EXPIRES` | `1d` (opcional) |
   | `CLIENT_URL` | La URL del proyecto, p. ej. `https://maccs.vercel.app` |

   `NODE_ENV=production` lo pone Vercel automáticamente (activa la cookie `secure`).
4. **MongoDB Atlas → Network Access**: agregar `0.0.0.0/0` (las funciones de
   Vercel no tienen IP fija).
5. Deploy. Verificar `https://<tu-dominio>/api/health` → `{ "status": "ok" }`.

## Desarrollo local (sin cambios)

```bash
pnpm install
pnpm dev
```

`server/.env` sigue siendo el archivo de entorno local (ver `server/.env.example`).

## Notas

- El JWT y las credenciales de Mongo del `server/.env` actual convienen rotarse
  antes de producción y **nunca** deben commitearse (`.env` está en `.gitignore`).
- El bundle del cliente pesa ~1.4 MB; considerar code-splitting con `import()`
  más adelante, no bloquea el despliegue.

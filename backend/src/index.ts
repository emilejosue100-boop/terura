import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL || 'http://localhost:5173');

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (health checks, curl) with no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (normalizeOrigin(origin) === frontendOrigin) {
        callback(null, frontendOrigin);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'terura-backend' });
});

app.use('/api', apiRoutes);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Terura backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

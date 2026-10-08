import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db/connectDB.js';
import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js';
import surveyRoutes from './routes/survey.routes.js';
import reportRoutes from './routes/report.routes.js';
import statsRoutes from './routes/stats.route.js';
import offerRoutes from './routes/offer.routes.js';
import contactRoutes from './routes/contact.route.js';
import coursesRoutes from './routes/courses.routes.js';
import privacyRoutes from './routes/privacy.routes.js';
import { v2 as cloudinary } from 'cloudinary';
import { assertSurveyEncryptionConfigured } from './services/surveyDataEncryption.service.js';

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  assertSurveyEncryptionConfigured();
}




const app = express();
const port = process.env.PORT || 5300; // achanger en 5000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin(origin, callback) {
      const allowUnconfiguredOrigin =
        process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0;
      if (!origin || allowUnconfiguredOrigin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origine non autorisée par CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
    ],
  })
);


// Traitement des requêtes d'options (pré-vol CORS)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({limit: '20mb'}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true , limit: '20mb'}));

app.get('/api/health', (req, res) => {
  res.json({ message: 'ok' });
});


const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
const syncLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 });
const privacyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

app.use('/api/auth/', authLimiter, userRoutes);
app.use('/api/stats/', statsRoutes);
app.use('/api/events/', eventRoutes);
app.use('/api/surveys/', syncLimiter, surveyRoutes);
app.use('/api/privacy/', privacyLimiter, privacyRoutes);
app.use('/api/reports/', reportRoutes);
app.use('/api/offers/', offerRoutes);
app.use('/api/contact/', contactRoutes);
app.use('/api/courses/', coursesRoutes);

const frontendBuildPath = path.join(__dirname, 'public');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});

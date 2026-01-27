import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
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
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();




const app = express();
const port = process.env.PORT || 5300; // achanger en 5000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
    ],
  })
);


// Traitement des requêtes d'options (pré-vol CORS)

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(bodyParser.json());

app.use(express.json({limit: '20mb'}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true , limit: '20mb'}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req, res, next) => {
  req.on('data', (chunk) => {
    console.log(`Received data: ${chunk.length} octets`);
  });
  req.on('end', () => {
    const contentLength = req.headers['content-length'];
    console.log(
      `Taille totale de la requête (Content-Length) : ${contentLength} octets`
    );
  });

  next();
});
app.use('/api/auth/', userRoutes);
app.use('/api/stats/', statsRoutes);
app.use('/api/events/', eventRoutes);
app.use('/api/surveys/', surveyRoutes);
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


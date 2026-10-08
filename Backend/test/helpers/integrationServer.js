import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../models/user.model.js';
import { Survey } from '../../models/survey.model.js';
import { ResponseSurvey } from '../../models/responseSurvey.model.js';
import { SyncAudit } from '../../models/syncAudit.model.js';
import { DataSubjectRequest } from '../../models/dataSubjectRequest.model.js';

export { User, Survey, ResponseSurvey, SyncAudit, DataSubjectRequest };

export async function startIntegrationServer() {
  process.env.JWT_SECRET = 'gabtrotter-disposable-integration-secret';
  process.env.SURVEY_DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  const stop = async () => {
    if (server) await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeIdleConnections();
    });
    await mongoose.disconnect();
    await mongo.stop();
  };

  try {
    await mongoose.connect(mongo.getUri(), { dbName: 'gabtrotter_tests' });
    await Promise.all([User, Survey, ResponseSurvey, SyncAudit, DataSubjectRequest].map(
      (model) => model.init(),
    ));
    const [{ default: userRoutes }, { default: surveyRoutes }, { default: privacyRoutes }] = await Promise.all([
      import('../../routes/user.routes.js'),
      import('../../routes/survey.routes.js'),
      import('../../routes/privacy.routes.js'),
    ]);
    const app = express();
    app.use(express.json({ limit: '20mb' }));
    app.get('/api/health', (_req, res) => res.json({ message: 'ok' }));
    app.use('/api/auth', userRoutes);
    app.use('/api/surveys', surveyRoutes);
    app.use('/api/privacy', privacyRoutes);
    server = await new Promise((resolve, reject) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
      listening.once('error', reject);
    });
    return { baseUrl: `http://127.0.0.1:${server.address().port}`, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}

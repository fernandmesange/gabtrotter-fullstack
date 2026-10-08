import express from 'express';
import {
  checkRightsRequest,
  downloadRightsAccessPackage,
  getRightsRequests,
  submitRightsRequest,
  updateRightsRequest,
} from '../controllers/privacy.controller.js';
import { requireRoles, verifyToken } from '../controllers/user.controllers.js';

const router = express.Router();

router.post('/requests', submitRightsRequest);
router.post('/requests/status', checkRightsRequest);
router.post('/requests/access', downloadRightsAccessPackage);
router.get('/requests', verifyToken, requireRoles('admin', 'supervisor'), getRightsRequests);
router.patch('/requests/:requestId', verifyToken, requireRoles('admin'), updateRightsRequest);

export default router;

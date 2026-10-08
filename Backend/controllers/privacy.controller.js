import {
  createRightsRequest,
  getRightsAccessPackage,
  getRightsRequestStatus,
  listRightsRequests,
  resolveRightsRequest,
} from '../services/dataSubjectRights.service.js';

const sendError = (res, error) => res
  .status(error.statusCode || 500)
  .json({ message: error.statusCode ? error.message : 'Erreur lors du traitement de la demande.' });

export const submitRightsRequest = async (req, res) => {
  try {
    const request = await createRightsRequest(req.body);
    return res.status(201).json({
      message: 'Demande enregistrée.',
      requestId: request.requestId,
      status: request.status,
      deadlineAt: request.deadlineAt,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const checkRightsRequest = async (req, res) => {
  try {
    return res.json(await getRightsRequestStatus(req.body));
  } catch (error) {
    return sendError(res, error);
  }
};

export const downloadRightsAccessPackage = async (req, res) => {
  try {
    return res.json(await getRightsAccessPackage(req.body));
  } catch (error) {
    return sendError(res, error);
  }
};

export const getRightsRequests = async (_req, res) => {
  try {
    return res.json({ requests: await listRightsRequests() });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateRightsRequest = async (req, res) => {
  try {
    const request = await resolveRightsRequest({
      requestId: req.params.requestId,
      actorId: req.userId,
      ...req.body,
    });
    return res.json({ requestId: request.requestId, status: request.status });
  } catch (error) {
    return sendError(res, error);
  }
};

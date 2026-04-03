const svc = require('../services/jobSearchService');
const { success } = require('../utils/response');

// ── Job Boards ────────────────────────────────────────────────────────────────

const getAllBoards = async (req, res, next) => {
  try {
    const boards = await svc.getAllBoards();
    return success(res, boards, 'Job boards retrieved.');
  } catch (err) { next(err); }
};

const createBoard = async (req, res, next) => {
  try {
    const board = await svc.createBoard(req.body);
    return success(res, board, 'Job board created.', 201);
  } catch (err) { next(err); }
};

const removeBoard = async (req, res, next) => {
  try {
    await svc.removeBoard(req.params.id);
    return success(res, null, 'Job board deleted.');
  } catch (err) { next(err); }
};

// ── Job Applications ──────────────────────────────────────────────────────────

const getAllApplications = async (req, res, next) => {
  try {
    const apps = await svc.getAllApplications();
    return success(res, apps, 'Applications retrieved.');
  } catch (err) { next(err); }
};

const createApplication = async (req, res, next) => {
  try {
    const app = await svc.createApplication(req.body);
    return success(res, app, 'Application created.', 201);
  } catch (err) { next(err); }
};

const updateApplication = async (req, res, next) => {
  try {
    const app = await svc.updateApplication(req.params.id, req.body);
    return success(res, app, 'Application updated.');
  } catch (err) { next(err); }
};

const removeApplication = async (req, res, next) => {
  try {
    await svc.removeApplication(req.params.id);
    return success(res, null, 'Application deleted.');
  } catch (err) { next(err); }
};

module.exports = {
  getAllBoards,
  createBoard,
  removeBoard,
  getAllApplications,
  createApplication,
  updateApplication,
  removeApplication,
};

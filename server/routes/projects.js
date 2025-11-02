const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
  addUpdate,
  addCollaborator,
  removeCollaborator
} = require('../controllers/projectController');

// All routes require authentication
router.use(protect);

// Project CRUD routes
router.get('/', getAllProjects);
router.post('/', createProject);
router.get('/user/:userId', getProjectsByUserId);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project updates and collaborators
router.post('/:id/updates', addUpdate);
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

module.exports = router;

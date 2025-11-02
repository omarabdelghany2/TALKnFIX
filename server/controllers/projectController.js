const Project = require('../models/Project');
const User = require('../models/User');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'username fullName avatar')
      .populate('collaborators', 'username fullName avatar')
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username fullName avatar')
      .populate('collaborators', 'username fullName avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get projects by user ID
exports.getProjectsByUserId = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.params.userId })
      .populate('owner', 'username fullName avatar')
      .populate('collaborators', 'username fullName avatar')
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const project = new Project({
      owner: req.user.id,
      title,
      description,
      status: status || 'future',
      collaborators: [],
      updates: []
    });

    await project.save();

    // Populate owner and collaborators before sending response
    await project.populate('owner', 'username fullName avatar');

    res.status(201).json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;

    await project.save();

    // Populate before sending response
    await project.populate('owner', 'username fullName avatar');
    await project.populate('collaborators', 'username fullName avatar');

    res.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add update to project
exports.addUpdate = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Update content is required' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const newUpdate = {
      content,
      createdAt: new Date()
    };

    project.updates.push(newUpdate);
    await project.save();

    res.json({ update: project.updates[project.updates.length - 1] });
  } catch (error) {
    console.error('Error adding update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add collaborator to project
exports.addCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can add collaborators' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a collaborator
    if (project.collaborators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Check if user is the owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Owner is automatically a collaborator' });
    }

    project.collaborators.push(userId);
    await project.save();

    await project.populate('collaborators', 'username fullName avatar');

    const addedCollaborator = project.collaborators.find(
      collab => collab._id.toString() === userId
    );

    res.json({ collaborator: addedCollaborator });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove collaborator from project
exports.removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can remove collaborators' });
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      collab => collab.toString() !== userId
    );

    await project.save();

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

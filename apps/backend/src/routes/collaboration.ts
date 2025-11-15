/**
 * Collaboration Routes - API endpoints for collaboration features
 */

import { Router } from 'express';
import collaborationService from '../services/collaboration/CollaborationService';

const router = Router();

// Add collaborator
router.post('/:designId/collaborators', async (req, res) => {
  try {
    const collaborator = await collaborationService.addCollaborator({
      design_id: req.params.designId,
      user_id: req.body.user_id,
      role: req.body.role || 'editor',
      invited_by: req.body.invited_by || 'default-user',
    });

    res.status(201).json({ success: true, collaborator });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ success: false, error: 'Failed to add collaborator' });
  }
});

// Get collaborators
router.get('/:designId/collaborators', async (req, res) => {
  try {
    const collaborators = await collaborationService.getCollaborators(req.params.designId);
    res.json({ success: true, collaborators });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ success: false, error: 'Failed to get collaborators' });
  }
});

// Remove collaborator
router.delete('/:designId/collaborators/:userId', async (req, res) => {
  try {
    const success = await collaborationService.removeCollaborator(
      req.params.designId,
      req.params.userId
    );

    if (!success) {
      return res.status(404).json({ success: false, error: 'Collaborator not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove collaborator' });
  }
});

// Create comment
router.post('/:designId/comments', async (req, res) => {
  try {
    const comment = await collaborationService.createComment({
      design_id: req.params.designId,
      user_id: req.body.user_id || 'default-user',
      content: req.body.content,
      object_id: req.body.object_id,
      x: req.body.x,
      y: req.body.y,
      parent_id: req.body.parent_id,
    });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ success: false, error: 'Failed to create comment' });
  }
});

// Get comments
router.get('/:designId/comments', async (req, res) => {
  try {
    const comments = await collaborationService.getComments(req.params.designId);
    res.json({ success: true, comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, error: 'Failed to get comments' });
  }
});

// Resolve comment
router.post('/comments/:id/resolve', async (req, res) => {
  try {
    const comment = await collaborationService.resolveComment(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    res.json({ success: true, comment });
  } catch (error) {
    console.error('Resolve comment error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve comment' });
  }
});

// Delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const success = await collaborationService.deleteComment(req.params.id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
});

// Create version
router.post('/:designId/versions', async (req, res) => {
  try {
    const version = await collaborationService.createVersion({
      design_id: req.params.designId,
      created_by: req.body.user_id || 'default-user',
      snapshot: req.body.snapshot,
      description: req.body.description,
    });

    res.status(201).json({ success: true, version });
  } catch (error) {
    console.error('Create version error:', error);
    res.status(500).json({ success: false, error: 'Failed to create version' });
  }
});

// Get versions
router.get('/:designId/versions', async (req, res) => {
  try {
    const versions = await collaborationService.getVersions(req.params.designId);
    res.json({ success: true, versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get versions' });
  }
});

// Restore version
router.post('/versions/:id/restore', async (req, res) => {
  try {
    const snapshot = await collaborationService.restoreVersion(req.params.id);
    
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    res.json({ success: true, snapshot });
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ success: false, error: 'Failed to restore version' });
  }
});

export default router;


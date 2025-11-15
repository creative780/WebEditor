/**
 * Template Routes - API endpoints for template management
 */

import { Router } from 'express';
import templateService from '../services/templates/TemplateService';

const router = Router();

// Create template
router.post('/', async (req, res) => {
  try {
    const template = await templateService.createTemplate({
      creator_id: req.body.user_id || 'default-user',
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      industry: req.body.industry,
      tags: req.body.tags || [],
      design_data: req.body.design_data,
      is_public: req.body.is_public,
      is_premium: req.body.is_premium,
      price: req.body.price,
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, error: 'Failed to create template' });
  }
});

// List templates
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      industry: req.query.industry as string,
      search: req.query.search as string,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await templateService.listTemplates(filters);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({ success: false, error: 'Failed to list templates' });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Track view
    await templateService.trackAnalytics(req.params.id, 'view');

    res.json({ success: true, template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ success: false, error: 'Failed to get template' });
  }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const success = await templateService.deleteTemplate(req.params.id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete template' });
  }
});

// Create template version
router.post('/:id/versions', async (req, res) => {
  try {
    const version = await templateService.createVersion({
      template_id: req.params.id,
      description: req.body.description,
      design_data: req.body.design_data,
      created_by: req.body.user_id || 'default-user',
    });

    res.status(201).json({ success: true, version });
  } catch (error) {
    console.error('Create version error:', error);
    res.status(500).json({ success: false, error: 'Failed to create version' });
  }
});

// Get template versions
router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await templateService.getVersions(req.params.id);
    res.json({ success: true, versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get versions' });
  }
});

// Create share link
router.post('/:id/share', async (req, res) => {
  try {
    const share = await templateService.createShare({
      template_id: req.params.id,
      expires_in: req.body.expires_in,
      password: req.body.password,
    });

    res.status(201).json({ success: true, share });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({ success: false, error: 'Failed to create share link' });
  }
});

// Get trending templates
router.get('/trending/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const templates = await templateService.getTrendingTemplates(limit);
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ success: false, error: 'Failed to get trending templates' });
  }
});

// Get template analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const analytics = await templateService.getAnalytics(req.params.id);
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

export default router;


/**
 * Export Routes - API endpoints for export functionality
 */

import { Router } from 'express';
import exportService from '../services/export/ExportService';

const router = Router();

// Create export job
router.post('/:designId/export', async (req, res) => {
  try {
    const job = await exportService.createExportJob({
      design_id: req.params.designId,
      user_id: req.body.user_id || 'default-user',
      format: req.body.format || 'pdf',
      quality: req.body.quality || 'high',
      options: req.body.options || {},
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Create export error:', error);
    res.status(500).json({ success: false, error: 'Failed to create export' });
  }
});

// Get export job status
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await exportService.getExportJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Export job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Get export job error:', error);
    res.status(500).json({ success: false, error: 'Failed to get export job' });
  }
});

// Get export history
router.get('/history/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await exportService.getExportHistory(req.params.userId, limit);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Get export history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get export history' });
  }
});

// Delete export job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const success = await exportService.deleteExportJob(req.params.id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Export job not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete export error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete export job' });
  }
});

// Batch export
router.post('/batch', async (req, res) => {
  try {
    const jobs = await exportService.createBatchExport({
      design_ids: req.body.design_ids,
      user_id: req.body.user_id || 'default-user',
      format: req.body.format || 'pdf',
      quality: req.body.quality || 'high',
      options: req.body.options || {},
    });

    res.status(201).json({ success: true, jobs });
  } catch (error) {
    console.error('Batch export error:', error);
    res.status(500).json({ success: false, error: 'Failed to create batch export' });
  }
});

// Get export statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const stats = await exportService.getExportStats(req.params.userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get export stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get export stats' });
  }
});

export default router;


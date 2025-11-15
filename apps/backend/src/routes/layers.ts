/**
 * Layer Management API Routes
 */

import { Router } from 'express';
import { Pool } from 'pg';
import { LayerService } from '../services/layers/LayerService';
import { blendingService } from '../services/layers/BlendingService';

export function createLayersRouter(db: Pool) {
  const router = Router();
  const layerService = new LayerService(db);

  // Reorder layers
  router.post('/designs/:designId/layers/reorder', async (req, res) => {
    try {
      const { designId } = req.params;
      const { objectId, newZIndex } = req.body;

      await layerService.reorderLayer(designId, objectId, newZIndex);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bring forward
  router.post('/designs/:designId/layers/:objectId/forward', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      await layerService.bringForward(designId, objectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send backward
  router.post('/designs/:designId/layers/:objectId/backward', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      await layerService.sendBackward(designId, objectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bring to front
  router.post('/designs/:designId/layers/:objectId/front', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      await layerService.bringToFront(designId, objectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send to back
  router.post('/designs/:designId/layers/:objectId/back', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      await layerService.sendToBack(designId, objectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create group
  router.post('/designs/:designId/layers/group', async (req, res) => {
    try {
      const { designId } = req.params;
      const { objectIds, groupName } = req.body;

      const group = await layerService.createGroup(designId, objectIds, groupName);

      res.json({ group });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ungroup
  router.post('/designs/:designId/layers/ungroup', async (req, res) => {
    try {
      const { designId } = req.params;
      const { groupId } = req.body;

      await layerService.ungroup(designId, groupId);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lock layer
  router.post('/designs/:designId/layers/:objectId/lock', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      await layerService.lockLayer(designId, objectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unlock layer
  router.post('/designs/:designId/layers/:objectId/unlock', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      await layerService.unlockLayer(designId, objectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle visibility
  router.post('/designs/:designId/layers/:objectId/toggle-visibility', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      const visible = await layerService.toggleVisibility(designId, objectId);
      res.json({ visible });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Duplicate layer
  router.post('/designs/:designId/layers/:objectId/duplicate', async (req, res) => {
    try {
      const { designId, objectId } = req.params;
      const newObject = await layerService.duplicateLayer(designId, objectId);
      res.json({ object: newObject });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get layer hierarchy
  router.get('/designs/:designId/layers/hierarchy', async (req, res) => {
    try {
      const { designId } = req.params;
      const hierarchy = await layerService.getLayerHierarchy(designId);
      res.json({ hierarchy });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply blend mode
  router.post('/layers/:layerId/blend-mode', async (req, res) => {
    try {
      const { layerId } = req.params;
      const { blendMode } = req.body;

      if (!blendingService.isValidBlendMode(blendMode)) {
        return res.status(400).json({ error: 'Invalid blend mode' });
      }

      const result = blendingService.applyBlendMode(layerId, blendMode);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply layer effects
  router.post('/layers/:layerId/effects', async (req, res) => {
    try {
      const { effect } = req.body;

      let layerEffect;
      switch (effect.type) {
        case 'drop-shadow':
          layerEffect = blendingService.createDropShadow(effect.properties);
          break;
        case 'outer-glow':
          layerEffect = blendingService.createOuterGlow(effect.properties);
          break;
        case 'inner-glow':
          layerEffect = blendingService.createInnerGlow(effect.properties);
          break;
        case 'bevel':
          layerEffect = blendingService.createBevel(effect.properties);
          break;
        default:
          return res.status(400).json({ error: 'Invalid effect type' });
      }

      res.json({ effect: layerEffect });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}


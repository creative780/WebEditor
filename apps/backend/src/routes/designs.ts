import express from 'express';
import DesignService from '../services/design/DesignService';
import TransformService from '../services/design/TransformService';

const router = express.Router();

// Middleware to extract userId (simplified - in production use proper auth)
const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // For now, use a test user ID
  // In production, decode JWT token
  (req as any).userId = 'test-user-id';
  next();
};

// Create design
router.post('/', auth, async (req, res) => {
  try {
    const design = await DesignService.createDesign((req as any).userId, req.body);
    res.json(design);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List designs
router.get('/', auth, async (req, res) => {
  try {
    const designs = await DesignService.listDesigns((req as any).userId);
    res.json(designs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get design
router.get('/:id', auth, async (req, res) => {
  try {
    const design = await DesignService.getDesignWithObjects(req.params.id, (req as any).userId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update design
router.put('/:id', auth, async (req, res) => {
  try {
    const design = await DesignService.updateDesign(req.params.id, (req as any).userId, req.body);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete design
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await DesignService.deleteDesign(req.params.id, (req as any).userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create object
router.post('/:id/objects', auth, async (req, res) => {
  try {
    const object = await DesignService.createObject(req.params.id, (req as any).userId, req.body);
    res.json(object);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update object
router.put('/:id/objects/:objectId', auth, async (req, res) => {
  try {
    const object = await DesignService.updateObject(
      req.params.objectId,
      req.params.id,
      (req as any).userId,
      req.body
    );
    if (!object) {
      return res.status(404).json({ error: 'Object not found' });
    }
    res.json(object);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete object
router.delete('/:id/objects/:objectId', auth, async (req, res) => {
  try {
    const deleted = await DesignService.deleteObject(req.params.objectId, req.params.id, (req as any).userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Object not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Align objects
router.post('/:id/transform/align', auth, async (req, res) => {
  try {
    const { objectIds, alignment } = req.body;
    const objects = await TransformService.alignObjects(req.params.id, objectIds, alignment);
    res.json(objects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Distribute objects
router.post('/:id/transform/distribute', auth, async (req, res) => {
  try {
    const { objectIds, direction } = req.body;
    const objects = await TransformService.distributeObjects(req.params.id, objectIds, direction);
    res.json(objects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Align to canvas
router.post('/:id/transform/align-to-canvas', auth, async (req, res) => {
  try {
    const { objectIds, alignment } = req.body;
    const objects = await TransformService.alignToCanvas(req.params.id, objectIds, alignment);
    res.json(objects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


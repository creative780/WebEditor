import express from 'express';
import ShapeService from '../services/shapes/ShapeService';
import BooleanService from '../services/shapes/BooleanService';

const router = express.Router();

// Generate shape
router.post('/generate', async (req, res) => {
  try {
    const { type, config, ...params } = req.body;
    let path = '';

    switch (type) {
      case 'polygon':
        const polygonPoints = ShapeService.generatePolygonPoints(params.sides || 6, config);
        path = ShapeService.pointsToPath(polygonPoints, true);
        break;

      case 'star':
        const starPoints = ShapeService.generateStarPoints(
          params.points || 5,
          params.innerRadius || 0.5,
          config
        );
        path = ShapeService.pointsToPath(starPoints, true);
        break;

      case 'arrow':
        path = ShapeService.generateArrowPath(params.style || 'simple', config);
        break;

      case 'callout':
        path = ShapeService.generateCalloutPath(params.style || 'rounded', config, params.tailPosition || 0.5);
        break;

      case 'heart':
        path = ShapeService.generateHeartPath(config);
        break;

      case 'gear':
        path = ShapeService.generateGearPath(params.teeth || 8, config);
        break;

      default:
        return res.status(400).json({ error: 'Invalid shape type' });
    }

    res.json({ pathData: path });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Boolean operation
router.post('/boolean', async (req, res) => {
  try {
    const { path1, path2, operation } = req.body;
    const result = await BooleanService.performBooleanOperation(path1, path2, operation);
    res.json({ pathData: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Simplify path
router.post('/simplify', async (req, res) => {
  try {
    const { pathData, tolerance } = req.body;
    const simplified = ShapeService.simplifyPath(pathData, tolerance);
    res.json({ pathData: simplified });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Smooth path
router.post('/smooth', async (req, res) => {
  try {
    const { pathData, smoothness } = req.body;
    const smoothed = ShapeService.smoothPath(pathData, smoothness);
    res.json({ pathData: smoothed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


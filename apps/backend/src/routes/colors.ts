import express from 'express';
import ColorService from '../services/color/ColorService';
import ColorConversion from '../services/color/ColorConversion';
import ColorValidation from '../services/color/ColorValidation';
import PantoneService from '../services/color/PantoneService';

const router = express.Router();

// Convert color between formats
router.post('/convert', async (req, res) => {
  try {
    const { color, from, to } = req.body;
    
    if (!color || !from || !to) {
      return res.status(400).json({ error: 'Missing required parameters: color, from, to' });
    }

    const result = ColorService.convert(color, from, to);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Validate color for print
router.post('/validate', async (req, res) => {
  try {
    const { color } = req.body;
    
    if (!color) {
      return res.status(400).json({ error: 'Missing required parameter: color' });
    }

    const validation = ColorService.validate(color);
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Batch validate colors
router.post('/validate/batch', async (req, res) => {
  try {
    const { colors } = req.body;
    
    if (!colors || !Array.isArray(colors)) {
      return res.status(400).json({ error: 'Missing required parameter: colors (array)' });
    }

    const results = ColorValidation.batchValidate(colors);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search Pantone colors
router.get('/pantone/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Missing query parameter: q' });
    }

    const results = PantoneService.search(q as string);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pantone by code
router.get('/pantone/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const pantone = PantoneService.getByCode(decodeURIComponent(code));
    
    if (!pantone) {
      return res.status(404).json({ error: 'Pantone color not found' });
    }

    res.json(pantone);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Pantone colors
router.get('/pantone', async (req, res) => {
  try {
    const { category } = req.query;
    
    if (category) {
      const colors = PantoneService.getByCategory(category as any);
      return res.json({ colors });
    }

    const colors = PantoneService.getAll();
    res.json({ colors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Find closest Pantone match
router.post('/pantone/match', async (req, res) => {
  try {
    const { color } = req.body;
    
    if (!color) {
      return res.status(400).json({ error: 'Missing required parameter: color' });
    }

    const rgb = ColorConversion.hexToRgb(color);
    const match = PantoneService.findClosestMatch(rgb);
    
    res.json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate gradient
router.post('/gradients/generate', async (req, res) => {
  try {
    const { startColor, endColor, intermediateColors, type, stops } = req.body;
    
    let gradient;
    
    if (stops) {
      // Custom gradient with explicit stops
      gradient = { type: type || 'linear', stops, angle: req.body.angle || 0 };
    } else {
      // Auto-generate gradient
      gradient = ColorService.createGradient(
        startColor,
        endColor,
        intermediateColors || [],
        type || 'linear'
      );
    }

    const css = ColorService.gradientToCSS(gradient);
    
    res.json({ gradient, css });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize gradient
router.post('/gradients/optimize', async (req, res) => {
  try {
    const { gradient } = req.body;
    
    if (!gradient) {
      return res.status(400).json({ error: 'Missing required parameter: gradient' });
    }

    const optimized = ColorService.optimizeGradient(gradient);
    const css = ColorService.gradientToCSS(optimized);
    
    res.json({ gradient: optimized, css });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate color harmony
router.post('/harmony', async (req, res) => {
  try {
    const { color, scheme } = req.body;
    
    if (!color || !scheme) {
      return res.status(400).json({ error: 'Missing required parameters: color, scheme' });
    }

    const harmony = ColorService.generateHarmony(color, scheme);
    res.json(harmony);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate color palette
router.post('/palette/generate', async (req, res) => {
  try {
    const { baseColor, count } = req.body;
    
    if (!baseColor) {
      return res.status(400).json({ error: 'Missing required parameter: baseColor' });
    }

    const palette = ColorService.generatePalette(baseColor, count || 5);
    res.json({ palette });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Extract colors from image
router.post('/palette/from-image', async (req, res) => {
  try {
    const { imageUrl, count } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing required parameter: imageUrl' });
    }

    const colors = await ColorService.extractColorsFromImage(imageUrl, count || 5);
    res.json({ colors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check color accessibility
router.post('/accessibility', async (req, res) => {
  try {
    const { foreground, background } = req.body;
    
    if (!foreground || !background) {
      return res.status(400).json({ error: 'Missing required parameters: foreground, background' });
    }

    const result = ColorService.checkAccessibility(foreground, background);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Interpolate colors
router.post('/interpolate', async (req, res) => {
  try {
    const { color1, color2, steps } = req.body;
    
    if (!color1 || !color2) {
      return res.status(400).json({ error: 'Missing required parameters: color1, color2' });
    }

    const colors = ColorService.interpolateGradient(color1, color2, steps || 10);
    res.json({ colors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


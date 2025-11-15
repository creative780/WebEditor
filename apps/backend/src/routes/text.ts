import express from 'express';
import TextService from '../services/text/TextService';

const router = express.Router();

// List available fonts
router.get('/fonts', async (req, res) => {
  try {
    const fonts = await TextService.listFonts();
    res.json(fonts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate text metrics
router.post('/metrics', async (req, res) => {
  try {
    const { text, fontFamily, fontSize } = req.body;
    const metrics = await TextService.calculateTextMetrics(text, fontFamily, fontSize);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Format rich text
router.post('/format', async (req, res) => {
  try {
    const { text, format } = req.body;
    const formatted = TextService.formatRichText(text, format);
    res.json({ formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate text on path
router.post('/text-on-path', async (req, res) => {
  try {
    const { text, pathData, offset } = req.body;
    const chars = TextService.calculateTextOnPath(text, pathData, offset);
    res.json({ chars });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


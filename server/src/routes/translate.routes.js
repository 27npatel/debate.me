// server/src/routes/translate.routes.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { TranslationServiceClient } from '@google-cloud/translate';

const router = express.Router();

// Compute __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point at the service-account JSON in the server/ folder
const keyFile = path.join(__dirname, '../../google-sa.json');

// Create the client using that JSON
const client = new TranslationServiceClient({ keyFilename: keyFile });

// Your GCP project and location
const PROJECT_ID = 'debate-me-458103';
const LOCATION = 'global';

// POST /api/translate
router.post('/translate', async (req, res) => {
  const { text, sourceLang = 'en', targetLang } = req.body;
  if (!text || !targetLang) {
    return res
      .status(400)
      .json({ error: 'Missing "text" or "targetLang" in request body' });
  }

  try {
    // Translate
    const [response] = await client.translateText({
      parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLang,
      targetLanguageCode: targetLang,
    });

    const translatedText = response.translations[0].translatedText;
    return res.json({ translatedText });

  } catch (err) {
    console.error('Service-account translate error:', err);
    return res
      .status(err.code || 500)
      .json({ error: err.message || 'Translation failed' });
  }
});

export default router;


import express from 'express';
import {
  generateArticle,
  generateTitles,
  generateQuotes,
  rewriteText
} from '../Controllers/textGenerationController.js';

const router = express.Router();


router.post('/article', generateArticle);
router.post('/titles', generateTitles);
router.post('/quotes', generateQuotes);
router.post('/rewrite', rewriteText);

export default router;

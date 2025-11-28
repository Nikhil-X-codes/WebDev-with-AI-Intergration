import express from 'express';
import {
  classifyTicket,
  analyzeResume,
  analyzeSentiment
} from '../Controllers/classificationController.js';
import { upload, handleUploadError } from '../middlewares/multermiddleware.js';

const router = express.Router();

router.post('/ticket', classifyTicket);

router.post(
  '/resume',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return handleUploadError(err, res);
      }
      next();
    });
  },
  analyzeResume
);

router.post('/sentiment', analyzeSentiment);

export default router;

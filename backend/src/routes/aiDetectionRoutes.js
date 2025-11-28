import express from 'express';
import { 
  detectContent, 
} from '../Controllers/aiDetectionController.js';

const router = express.Router();

router.post('/detect', detectContent);

export default router;

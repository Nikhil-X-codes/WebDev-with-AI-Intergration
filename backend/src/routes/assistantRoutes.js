import { Router } from 'express';
import { respondAssistant } from '../Controllers/assistantController.js';
import { upload, handleUploadError } from '../middlewares/multermiddleware.js';


const router = Router();

router.post(
  '/respond',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return handleUploadError(err, res);
      }
      next();
    });
  },
  respondAssistant
);

export default router;

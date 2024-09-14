import express from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares';
import { generateThumbnail, saveThumbnail } from '../controllers/imageController';

const router = express.Router();

router.route('/')
  .post(
    body('topic').notEmpty().escape(),
    validate,
    generateThumbnail,
    saveThumbnail
  );

export default router;
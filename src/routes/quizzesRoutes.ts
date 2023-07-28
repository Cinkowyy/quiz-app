import express from 'express';

import authorization from '../middleware/authMiddleware';
import { createQuiz } from '../controllers/quizzesController';

const router = express.Router();

router.post('/createQuiz', authorization, createQuiz)

export default router
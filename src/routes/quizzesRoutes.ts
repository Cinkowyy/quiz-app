import express from 'express';

import authorization from '../middleware/authMiddleware';
import { createQuiz, getQuizzes } from '../controllers/quizzesController';

const router = express.Router();

router.post('/createQuiz', authorization, createQuiz)
router.get('/getQuizzes', getQuizzes)

export default router
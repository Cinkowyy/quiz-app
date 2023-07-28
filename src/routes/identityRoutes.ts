import express from 'express';

import { getUser, register, login } from '../controllers/identityController';
import authorization from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register)
router.post('/login', login)

router.get('/getUser', authorization, getUser)

export default router
import express from 'express';

import { getUser, register, login } from '../controllers/identityController';

const router = express.Router();

router.post('/register', register)
router.post('/login', login)

router.get('/getUser', getUser)

export default router
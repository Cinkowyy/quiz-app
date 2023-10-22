import {Router} from 'express';

import getAuthorization from '../middleware/authMiddleware';
import { getCreateQuizController, getQuizzesController } from '../controllers/quizzesController';
import { PrismaClient } from '@prisma/client';

const getQuizzesRoutes = ({prisma, jwtSecret}: {prisma: PrismaClient, jwtSecret: string}) => {

    const router = Router();
    
    router.post('/createQuiz', getAuthorization({jwtSecret}), getCreateQuizController({prisma}))
    router.get('/getQuizzes', getQuizzesController({prisma}))

    return router
}


export default getQuizzesRoutes
import { Router } from 'express';

import getAuthorization from '../middleware/authMiddleware';
import { getCategoriesController, getCreateQuizController, getQuizzesController } from '../controllers/quizzesController';
import { PrismaClient } from '@prisma/client';
import { JwtInfo } from '../utils/jwtInfo';
import validation from '../middleware/validationMiddleware';
import { quizValidationSchema } from '../types/quizTypes';

const getQuizzesRoutes = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    const router = Router();

    router.post('/createQuiz', getAuthorization({ jwtSecret: jwtInfo.secret }), validation(quizValidationSchema), getCreateQuizController({ prisma }))
    
    router.get('/getQuizzes', getQuizzesController({ prisma }))
    
    router.get('/getCategories', getCategoriesController({ prisma }))

    return router
}


export default getQuizzesRoutes
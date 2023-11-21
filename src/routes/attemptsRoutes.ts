import { Router } from 'express';

import { PrismaClient } from '@prisma/client';
import { JwtInfo } from '../utils/jwtInfo';
import { getBeginAttemptController } from '../controllers/attemptsController';
import getAuthorization from '../middleware/authMiddleware';

const getAttemptsRoutes = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    const router = Router();

    router.post('/beginAttempt',getAuthorization({ jwtSecret: jwtInfo.secret }), getBeginAttemptController({prisma}))

    return router

}

export default getAttemptsRoutes
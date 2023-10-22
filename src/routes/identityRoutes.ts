import {Router} from 'express';

import { getUserController, getRegisterController, getLoginController } from '../controllers/identityController';
import authorization from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';

const getIdentityRoutes = ({prisma, jwtSecret}: {prisma: PrismaClient, jwtSecret: string}) => {

    const router = Router();
    
    router.post('/register', getRegisterController({prisma}))
    router.post('/login', getLoginController({prisma, jwtSecret}))
    
    router.get('/getUser', authorization, getUserController({prisma}))

    return router
}


export default getIdentityRoutes
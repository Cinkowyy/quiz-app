import {Router} from 'express';

import { getUserController, getRegisterController, getLoginController } from '../controllers/identityController';
import getAuthorization from '../middleware/authMiddleware';
import validation from '../middleware/validationMiddleware';
import { PrismaClient } from '@prisma/client';
import { registerValidationSchema } from '../types/userTypes';

const getIdentityRoutes = ({prisma, jwtSecret}: {prisma: PrismaClient, jwtSecret: string}) => {

    const router = Router();
    
    router.post('/register',validation(registerValidationSchema), getRegisterController({prisma}))
    router.post('/login', getLoginController({prisma, jwtSecret}))
    
    router.get('/getUser', getAuthorization({jwtSecret}), getUserController({prisma}))

    return router
}


export default getIdentityRoutes
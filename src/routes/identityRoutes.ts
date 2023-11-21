import { Router } from 'express';

import { getUserController, getRegisterController, getLoginController, getLogoutController, getRefreshController } from '../controllers/identityController';
import getAuthorization from '../middleware/authMiddleware';
import validation from '../middleware/validationMiddleware';
import { PrismaClient } from '@prisma/client';
import { loginValidationSchema, logoutValidationSchema, refreshValidationSchema, registerValidationSchema } from '../types/userTypes';
import { JwtInfo } from '../utils/jwtInfo';

const getIdentityRoutes = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    const router = Router();

    router.post('/register', validation(registerValidationSchema), getRegisterController({ prisma }))

    router.post('/login', validation(loginValidationSchema), getLoginController({ prisma, jwtInfo }))

    router.get('/getUser', getAuthorization({ jwtSecret: jwtInfo.secret }), getUserController({ prisma }))

    router.post('/logout', validation(logoutValidationSchema), getLogoutController({ prisma }))
    
    router.post('/refresh', validation(refreshValidationSchema), getRefreshController({ prisma, jwtInfo }))

    return router
}


export default getIdentityRoutes
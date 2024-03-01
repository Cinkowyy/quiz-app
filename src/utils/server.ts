import express from 'express';

import getIdentityRoutes from "../routes/identityRoutes";
import getQuizzesRoutes from "../routes/quizzesRoutes";
import errorHandler from '../middleware/errorMiddleware';
import getAttemptsRoutes from '../routes/attemptsRoutes';
import { PrismaClient } from '@prisma/client';
import { JwtInfo } from './jwtInfo';

const createApp = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();
    });

    app.get('/', (req, res) => {
        res.send('Hello!')
    })

    app.get('/error', (req, res) => {
        res.status(400)
        throw new Error("Testowy errorek")
    })

    app.use('/identity', getIdentityRoutes({ prisma, jwtInfo }))
    app.use('/quizzes', getQuizzesRoutes({ prisma, jwtInfo }))
    app.use('/attempts', getAttemptsRoutes({ prisma, jwtInfo }))

    app.use(errorHandler)

    return app
}

export default createApp
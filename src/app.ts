import express from 'express';
import 'dotenv/config'

import getIdentityRoutes from "./routes/identityRoutes";
import getQuizzesRoutes from "./routes/quizzesRoutes";
import errorHandler from './middleware/errorMiddleware';
import { PrismaClient } from '@prisma/client';
import getAttemptsRoutes from './routes/attemptsRoutes';

const port = process.env.PORT || 3000
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error("No required ENV variables")

const jwtInfo = {
  secret: jwtSecret,
  timeout: "1h",
  refreshTokenTimeout: "1d"
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

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

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
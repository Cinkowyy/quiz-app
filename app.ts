import express from 'express';
import 'dotenv/config'

import identityRoutes from "./src/routes/identityRoutes";
import quizzesRoutes from "./src/routes/quizzesRoutes";
import errorHandler from './src/middleware/errorMiddleware';
import connectDB from './src/config/db';

const port = process.env.PORT || 3000

connectDB()

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

app.use('/identity', identityRoutes)
app.use('/quizzes', quizzesRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
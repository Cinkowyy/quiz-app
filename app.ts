import express from 'express';
import 'dotenv/config'

import identityRoutes from "./src/routes/identityRoutes";
import errorHandler from './src/middleware/errorMiddleware';

const port = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/error', (req, res) => {
  res.status(400)
  throw new Error("Testowy errorek")
})

app.use('/identity', identityRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
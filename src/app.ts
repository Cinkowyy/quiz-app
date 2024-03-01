import 'dotenv/config'
import { PrismaClient } from '@prisma/client';
import createApp from './utils/server';

const port = process.env.PORT || 3000
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error("No required ENV variables")

const jwtInfo = {
  secret: jwtSecret,
  timeout: "1h",
  refreshTokenTimeout: "1d"
}

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
})


const app = createApp({prisma, jwtInfo})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
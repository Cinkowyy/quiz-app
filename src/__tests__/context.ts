import { PrismaClient } from '@prisma/client'
import 'dotenv/config';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { JwtInfo } from '../utils/jwtInfo'

export type Context = {
  prisma: PrismaClient
  jwtInfo: JwtInfo
}

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>
  jwtInfo: JwtInfo
}

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error("No required ENV variables")

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
    jwtInfo: {
    secret: jwtSecret,
    timeout: "5min",
    refreshTokenTimeout: "15min"
}
  }
}
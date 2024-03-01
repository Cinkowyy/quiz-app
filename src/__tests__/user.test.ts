import supertest from "supertest";
import 'dotenv/config';
import createApp from "../utils/server";
import { PrismaClient } from "@prisma/client";

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error("No required ENV variables")

const jwtInfo = {
    secret: jwtSecret,
    timeout: "5min",
    refreshTokenTimeout: "15min"
}

const prisma = new PrismaClient({
    log: ['warn', 'error'],
})

const app = createApp({ prisma, jwtInfo });

describe("user", () => {
    describe("identity login route", () => {
        describe("given playload has missing param", () => {
            it("should return a 400", async () => {
                const email = "test@test.pl"

                const { body, statusCode } = await supertest(app).post('/identity/login').send({
                    email,
                })

                expect(statusCode).toBe(400)
                expect(body.error).toBe('ValidationError')

            })
        })
        describe("given credentials are invalid", () => {
            it("should return a 400", async () => {
                const email = "test@test.pl"
                const password = "qwerty123"

                const { body, statusCode } = await supertest(app).post('/identity/login').send({
                    email,
                    password
                })

                expect(statusCode).toBe(400)
                expect(body.error).toBe('InvalidCredentials')

            })
        })
        describe("given credentials are valid", () => {
            it("should return a 200 status and tokens", async () => {
                const email = "cinkowyy@test.pl"
                const password = "1qazxsW@"

                const { body, statusCode } = await supertest(app).post('/identity/login').send({
                    email,
                    password
                })

                expect(statusCode).toBe(200)
                expect(typeof body['accessToken']).toBe('string')
                expect(typeof body['refreshToken']).toBe('string')

            })
        })
    })

})
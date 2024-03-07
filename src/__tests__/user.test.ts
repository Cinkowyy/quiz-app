import supertest from 'supertest';
import 'dotenv/config';
import createApp from '../utils/server';
import { PrismaClient } from '@prisma/client';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('No required ENV variables');

const jwtInfo = {
    secret: jwtSecret,
    timeout: '5min',
    refreshTokenTimeout: '15min',
};

const prisma = new PrismaClient({
    log: ['warn', 'error'],
});

const app = createApp({ prisma, jwtInfo });

const user = {
    nickname: 'VoVa',
    email: 'vova@test.pl',
    password: 'qwerty123',
};

describe('user', () => {
    describe('identity register route', () => {
        describe('given playload has missing param', () => {
            it('should return a 400', async () => {
                const email = 'test@test.pl';
                const password = 'qwerty123';

                const { body, statusCode } = await supertest(app).post('/identity/register').send({
                    email,
                    password,
                });

                expect(statusCode).toBe(400);
                expect(body.error).toBe('ValidationError');
            });
        }),
            describe('given credentials are valid', () => {
                it('should return a 201 status', async () => {
                    const { statusCode } = await supertest(app)
                        .post('/identity/register')
                        .send(user);

                    expect(statusCode).toBe(201);
                });
            });
        describe('user with given email exists', () => {
            it('should return a 400', async () => {
                const { body, statusCode } = await supertest(app)
                    .post('/identity/register')
                    .send(user);

                expect(statusCode).toBe(400);
                expect(body.error).toBe('UserExists');
            });
        });
    });
    describe('identity login route', () => {
        describe('given playload has missing param', () => {
            it('should return a 400', async () => {
                const email = 'test@test.pl';

                const { body, statusCode } = await supertest(app).post('/identity/login').send({
                    email,
                });

                expect(statusCode).toBe(400);
                expect(body.error).toBe('ValidationError');
            });
        });
        describe('given credentials are invalid', () => {
            it('should return a 400', async () => {
                const email = 'test@test.pl';
                const password = 'qwerty123';

                const { body, statusCode } = await supertest(app).post('/identity/login').send({
                    email,
                    password,
                });

                expect(statusCode).toBe(400);
                expect(body.error).toBe('InvalidCredentials');
            });
        });
        describe('given credentials are valid', () => {
            it('should return a 200 status and tokens', async () => {
                const { body, statusCode } = await supertest(app).post('/identity/login').send({
                    email: user.email,
                    password: user.password,
                });

                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                });
            });
        });
    }),
    afterAll(async () => {
        const userToDelete = await prisma.users.findFirst({
            where: {
                email: user.email,
            },
        });
        if (userToDelete)
            await prisma.users.delete({
                where: {
                    id: userToDelete.id,
                },
            });

        prisma.$disconnect();
    });
});

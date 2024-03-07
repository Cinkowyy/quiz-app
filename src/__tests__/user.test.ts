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

const tokenWithNotExistingSession =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYWZhOTM1ZC04NDcxLTExZWUtOTE1OC0wMjQyYWMxNDAwMDIiLCJqdGkiOiI1ZGFmNTRlZi04NDcxLTExZWUtOTE1OC0wMjQyYWMxNDAwMDIiLCJpYXQiOjE3MDAxMzMyOTMsImV4cCI6MTcwMDIxOTY5M30.PYk1mll6Y3trsu_uuOdmlokV-_7VChu5bNhDnFtX6A4';

let validRefreshToken: string;

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

                validRefreshToken = body.refreshToken;
            });
        });
    }),
        describe('identity logout route', () => {
            describe('given payload has no refresh token', () => {
                it('should return a 400 status', async () => {
                    const { body, statusCode } = await supertest(app).post('/identity/logout');

                    expect(statusCode).toBe(400);
                    expect(body.error).toBe('ValidationError');
                });
            });
            describe('given refresh token is invalid', () => {
                it('should return a 401 status', async () => {
                    const { body, statusCode } = await supertest(app)
                        .post('/identity/logout')
                        .send({
                            refreshToken: 'invalidRefreshTOken',
                        });

                    expect(statusCode).toBe(401);
                    expect(body.error).toBe('InvalidRefreshToken');
                });
            });
            describe('session not found', () => {
                it('should return a 404 status', async () => {
                    const { body, statusCode } = await supertest(app)
                        .post('/identity/logout')
                        .send({
                            refreshToken: tokenWithNotExistingSession,
                        });

                    expect(statusCode).toBe(404);
                    expect(body.error).toBe('SessionNotFound');
                });
            });
            describe('session succesfully deleted', () => {
                it('should return a 204 status', async () => {
                    const { statusCode } = await supertest(app).post('/identity/logout').send({
                        refreshToken: validRefreshToken,
                    });

                    expect(statusCode).toBe(204);
                });
            });
        });
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

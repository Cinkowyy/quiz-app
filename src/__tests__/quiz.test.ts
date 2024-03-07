import supertest from 'supertest';
import 'dotenv/config';
import createApp from '../utils/server';
import { PrismaClient } from '@prisma/client';
import { quizzes } from '../data/dataToSeed';

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

const user = {
    nickname: 'AdrianQ',
    email: 'adrian22@test.pl',
    password: 'qwerty123',
};

let accessToken: string;
let validQuizId: string;
const invalidQuizId = 'ce8d663a23a4814aa509ed437336e28148ee';
let categoryId: string;

const quizToadd = quizzes[0];

const app = createApp({ prisma, jwtInfo });

describe('quiz', () => {
    beforeAll(async () => {
        await supertest(app).post('/identity/register').send(user);
        const { body } = await supertest(app).post('/identity/login').send(user);
        accessToken = body.accessToken;
    });
    describe('quiz getCategories route', () => {
        it('should return 200 status with categories array', async () => {
            const { body, statusCode } = await supertest(app).get('/quizzes/getCategories');

            expect(statusCode).toBe(200);
            expect(Array.isArray(body)).toBeTruthy();

            expect(body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                    }),
                ])
            );

            categoryId = body[0].id;
        });
    });
    describe('quiz getQuizzes route', () => {
        it('should return 200 status with quizzes array', async () => {
            const { body, statusCode } = await supertest(app).get('/quizzes/getQuizzes');

            expect(statusCode).toBe(200);
            expect(Array.isArray(body)).toBeTruthy();

            expect(body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        title: expect.any(String),
                        duration: expect.any(Number),
                        category: expect.any(String),
                        questionsCount: expect.any(Number),
                        author: expect.objectContaining({
                            id: expect.any(String),
                            nickname: expect.any(String),
                        }),
                    }),
                ])
            );

            validQuizId = body[0].id;
        });
    });
    describe('quiz getQuiz route', () => {
        describe('given quizId is invalid', () => {
            it('should return 404 status', async () => {
                const { body, statusCode } = await supertest(app).get(
                    '/quizzes/getQuiz/' + invalidQuizId
                );

                expect(statusCode).toBe(404);
                expect(body.error).toBe('QuizNotFound');
            });
        });
        describe('given quizId is valid', () => {
            it('should return 200 status with quiz data', async () => {
                const { body, statusCode } = await supertest(app).get(
                    '/quizzes/getQuiz/' + validQuizId
                );

                expect(statusCode).toBe(200);
                expect(body).toEqual(
                    expect.objectContaining({
                        id: expect.any(String),
                        title: expect.any(String),
                        duration: expect.any(Number),
                        questions: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.any(String),
                                content: expect.any(String),
                                type: expect.any(String),
                                answers: expect.arrayContaining([
                                    expect.objectContaining({
                                        id: expect.any(String),
                                        content: expect.any(String),
                                        isCorrect: expect.any(Boolean),
                                    }),
                                ]),
                            }),
                        ]),
                    })
                );
            });
        });
    });
    describe('quiz createQuiz route', () => {
        describe('given request unathorized', () => {
            it('should return 401 status', async () => {
                const { statusCode } = await supertest(app)
                    .post('/quizzes/createQuiz')
                    .send(quizToadd);

                expect(statusCode).toBe(401);
            });
        });
        describe('given payload is invalid', () => {
            it('should return 400 status', async () => {
                const { body, statusCode } = await supertest(app)
                    .post('/quizzes/createQuiz')
                    .auth(accessToken, { type: 'bearer' })
                    .send(quizToadd);

                expect(statusCode).toBe(400);
                expect(body.error).toBe('ValidationError');
            });
        });
        describe('given payload valid', () => {
            it('should return 201 status with quizId', async () => {
                const { body, statusCode } = await supertest(app)
                    .post('/quizzes/createQuiz')
                    .auth(accessToken, { type: 'bearer' })
                    .send({
                        ...quizToadd,
                        categoryId,
                    });

                expect(statusCode).toBe(201);
                expect(body.quizId).toEqual(expect.any(String));
                validQuizId = body.quizId;
            });
        });
    });
    afterAll(async () => {
        await prisma.answers.deleteMany({
            where: {
                questions: {
                    quizId: validQuizId,
                },
            },
        });
        await prisma.questions.deleteMany({
            where: {
                quizId: validQuizId,
            },
        });
        await prisma.quizzes.delete({
            where: {
                id: validQuizId,
            },
        });
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

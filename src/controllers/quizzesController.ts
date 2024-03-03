import { NextFunction, Request, Response } from "express"

import { PrismaClient } from "@prisma/client"
import { TypedRequest } from "../types/typedRequests"
import { QuizRequestBody } from "../types/quizTypes"
import errorResponse from "../utils/errorResponse"

export const getCreateQuizController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<QuizRequestBody>, res: Response, next: NextFunction) => {

        try {

            const { title, categoryId, questions, duration, visibility } = req.body

            const userId = req?.userId

            if (!userId) throw new Error("Missing userId in auth")

            //TODO: check if category exists

            //tx means transaction
            const createdQuizId = await prisma.$transaction(async tx => {

                const quiz = await tx.quizzes.create({
                    data: {
                        title: title,
                        categoryId: categoryId,
                        author: userId,
                        duration: duration,
                        visibility: visibility
                    },
                    select: {
                        id: true
                    }
                })

                await Promise.all(questions.map(async (question) => {

                    await tx.questions.create({
                        data: {
                            content: question.content,
                            quizId: quiz.id,
                            type: question.type,
                            answers: {
                                createMany: {
                                    data: question.answers.map((answer) => ({
                                        content: answer.content,
                                        isCorrect: answer.isCorrect
                                    }))
                                }
                            }
                        }
                    })
                }));

                return quiz.id
            })


            res.status(201).json({
                message: "Quiz created",
                quizId: createdQuizId
            })

        } catch (error) {
            next(error)
        }
    }
}

export const getQuizzesController = ({ prisma }: { prisma: PrismaClient }) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const quizzesWithAuthors = await prisma.quizzes.findMany({
                select: {
                    id: true, title: true, duration: true, categories: {
                        select: {
                            name: true
                        }
                    }, users: {
                        select: { id: true, nickname: true }
                    },
                    _count: {
                        select: {
                            questions: true
                        }
                    },
                },
                where: {
                    visibility: 'public'
                }
            })

            if (!quizzesWithAuthors || quizzesWithAuthors.length < 1) {
                return errorResponse({
                    response: res,
                    status: 404,
                    message: "No quizzes to display",
                    error: "NoQuizzes"
                })
            }

            const mappedQuizzes = quizzesWithAuthors.map(quiz => {
                return {
                    id: quiz.id,
                    title: quiz.title,
                    duration: quiz.duration,
                    category: quiz.categories.name,
                    author: quiz.users,
                    questionsCount: quiz._count.questions
                }

            })

            return res.json(mappedQuizzes)

        } catch (error) {
            next(error)
        }
    }
}

export const getCategoriesController = ({ prisma }: { prisma: PrismaClient }) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const categories = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true
                }
            })

            if (categories.length == 0) {
                return errorResponse({
                    response: res,
                    status: 404,
                    message: "No categories",
                    error: "NoCategories"
                })
            }

            res.json(categories)
        } catch (error) {
            next(error)
        }
    }
}

export const getQuizController = ({ prisma }: { prisma: PrismaClient }) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const { quizId } = req.params;

        try {
            const quiz = await prisma.quizzes.findFirst(
                {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        questions: {
                            select: {
                                id: true,
                                content: true,
                                type: true,
                                answers: {
                                    select: {
                                        id: true,
                                        content: true,
                                        isCorrect: true
                                    }
                                }
                            }
                        }
                    },
                    where: { id: quizId }
                })

            if (!quiz) {
                return errorResponse({
                    response: res,
                    status: 404,
                    message: "Quiz not found",
                    error: "QuizNotFound"
                })
            }

            res.json(quiz)
        } catch (error) {
            next(error)
        }
    }
}

//TODO: add endpoint to change quiz visibility
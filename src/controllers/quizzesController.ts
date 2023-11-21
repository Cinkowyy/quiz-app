import { NextFunction, Request, Response } from "express"

import { PrismaClient } from "@prisma/client"
import { TypedRequest } from "../types/typedRequests"
import { quizRequestBody } from "../types/quizTypes"

export const getCreateQuizController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<quizRequestBody>, res: Response, next: NextFunction) => {

        try {

            const { title, questions, duration } = req.body

            const userId = req?.userId

            if (!userId) {
                console.error("No userId from auth")
                return res.status(500).json({
                    message: "Missing userId in auth"
                })
            }

            //tx means transaction
            const createdQuizId = await prisma.$transaction(async tx => {

                const quiz = await tx.quizzes.create({
                    data: {
                        title: title,
                        author: userId,
                        duration: duration,
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
                    id: true, title: true, duration: true, users: {
                        select: { id: true, nickname: true }
                    }
                }
            })

            if (!quizzesWithAuthors || quizzesWithAuthors.length < 1) {
                return res.status(404).json({
                    message: "No quizzes to display"
                })
            }

            return res.json(quizzesWithAuthors)

        } catch (error) {
            next(error)
        }
    }
}
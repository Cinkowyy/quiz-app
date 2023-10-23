import { Request, Response } from "express"

import { IQuizRequestBody } from "../types/quizTypes"

import { quizSchema } from "../types/quizTypes"
import { PrismaClient } from "@prisma/client"
import { TypedRequest } from "../types/typedRequests"

export const getCreateQuizController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<IQuizRequestBody>, res: Response) => {

        const { title, questions, duration } = req.body

        if (!title || !questions || !duration) {
            res.status(400)
            throw new Error("Please add all required fields")
        }

        const validatedQuiz = quizSchema.safeParse({
            title,
            questions, duration
        })

        if (!validatedQuiz.success) {
            console.log(validatedQuiz.error.errors)
            res.status(400)
            throw new Error("Invalid quiz data")
        }

        const { title: validatedTitle, questions: validatedQuestions, duration: validatedDuration } = validatedQuiz.data

        try {

            //tx means transaction
            const createdQuizId = await prisma.$transaction(async tx => {

                if (!req.userId) {
                    throw new Error('Author doesnt exist')
                }

                const quiz = await tx.quizzes.create({
                    data: {
                        title: validatedTitle,
                        author: req.userId,
                        duration: validatedDuration,
                    }
                })

                await Promise.all(validatedQuestions.map(async (question) => {

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
                message: "Quiz added",
                quizId: createdQuizId
            })

        } catch (error) {
            res.status(500)
            throw error
        }
    }
}

export const getQuizzesController = ({ prisma }: { prisma: PrismaClient }) => {
    return async (req: Request, res: Response) => {

        let quizzesWithAuthors;
        try {
            quizzesWithAuthors = await prisma.quizzes.findMany({
                select: {
                    id: true, title: true, duration: true, users: {
                        select: { id: true, nickname: true }
                    }
                }
            })
        } catch (error) {
            console.log(error)
            res.status(400)
            throw new Error("Smth went wrong")
        }

        if (quizzesWithAuthors.length < 1) {
            res.status(404)
            throw new Error("No quizzes to display")
        }

        res.status(200).json(quizzesWithAuthors)
    }
}
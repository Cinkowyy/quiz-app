import { PrismaClient } from "@prisma/client";
import { TypedRequest } from "../types/typedRequests";
import { NextFunction, Response } from "express";
import { BeginAttemptBody, SubmitAnswerBody, SubmitAttemptBody } from "../types/attemptsTypes";
import dayjs from "dayjs";
import ms from "ms";

export const getBeginAttemptController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<BeginAttemptBody>, res: Response, next: NextFunction) => {

        try {
            const userId = req?.userId
            const { quizId } = req.body

            if (!userId) {
                console.error("No userId from auth")
                return res.status(500).json({
                    message: "Missing userId in auth"
                })
            }

            const createdAttempt = await prisma.userAttempts.create({
                data: {
                    userId: userId,
                    quizId: quizId,
                }
            })

            return res.json({
                message: "Attempt created",
                attemptId: createdAttempt.id,
                createdAt: createdAttempt.createdAt
            })

        } catch (error) {
            next(error)
        }
    }
}

export const getSubmitAnswerController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<SubmitAnswerBody>, res: Response, next: NextFunction) => {
        try {
            const { answerId, attemptId, questionId } = req.body

            await prisma.userAnswers.create({
                data: {
                    answerId,
                    attemptId,
                    questionId
                }
            })

            return res.sendStatus(204)
            
        } catch (error) {
            next(error)
        }
    }
}

export const getSubmitAttemptController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<SubmitAttemptBody>, res: Response, next: NextFunction) => {

        try {
            const userId = req?.userId
            const { attemptId } = req.body

            if (!userId) {
                console.error("No userId from auth")
                return res.status(500).json({
                    message: "Missing userId in auth"
                })
            }

            const attempt = await prisma.userAttempts.findFirst({
                select: {
                    submittedAt: true
                },
                where: {
                    id: attemptId
                }
            })

            if (!attempt) {
                return res.status(404).json({
                    message: "Attempt not found"
                })
            }

            if (attempt.submittedAt) {
                return res.status(400).json({
                    message: "Attempt is already submitted"
                })
            }

            await prisma.userAttempts.update({
                data: {
                    submittedAt: ms(dayjs().millisecond()),
                },
                where: {
                    id: attemptId
                }
            })

            //TODO: test this and refactor
            const userAnswers = await prisma.answers.findMany({
                select: {
                    id: true,
                    questionId: true,
                    isCorrect: true,
                },
                where: {
                    userAnswers: {
                        every: {
                            attemptId: attemptId
                        }
                    }
                },
            })

            const questionsCount = userAnswers.length
            const correctCount = userAnswers.filter((answer) => answer.isCorrect).length

            return res.json({
                message: "Attempt submitted",
                questionsCount,
                correctCount
            })

        } catch (error) {
            next(error)
        }
    }
}
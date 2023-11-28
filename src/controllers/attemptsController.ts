import { PrismaClient } from "@prisma/client";
import { TypedRequest } from "../types/typedRequests";
import { NextFunction, Response } from "express";
import { BeginAttemptBody, SubmitAnswerBody, SubmitAttemptBody, SubmitGuestAttemptBody } from "../types/attemptsTypes";
import { calculateScore } from "../utils/quizzesManager";
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
                    quizId: true,
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

            const questionsList = await prisma.questions.findMany({
                select: {
                    id: true,
                    answers: {
                        select: {
                            id: true,
                            isCorrect: true
                        }
                    }
                },
                where: {
                    quizId: attempt.quizId
                }
            })
            
            const userAnswers = await prisma.userAnswers.findMany({
                select: {
                    questionId: true,
                    answerId: true
                },
                where: {
                    attemptId: attemptId
                }
            })

            const { userScore, maxScore } = calculateScore(questionsList, userAnswers)

            return res.json({
                message: "Attempt submitted",
                userScore,
                maxScore
            })

        } catch (error) {
            next(error)
        }
    }
}

export const getSubmitGuestAttemptController = ({ prisma }: { prisma: PrismaClient }) => {
    return async (req: TypedRequest<SubmitGuestAttemptBody>, res: Response, next: NextFunction) => {
        try {
            const { quizId, answers } = req.body

            const questionsList = await prisma.questions.findMany({
                select: {
                    id: true,
                    answers: {
                        select: {
                            id: true,
                            isCorrect: true
                        }
                    }
                },
                where: {
                    quizId: quizId
                }
            })

            if (questionsList.length < 1) {
                return res.status(400).json({
                    message: "No questions in this quiz. Probably bad quizId"
                })
            }

            const { userScore, maxScore } = calculateScore(questionsList, answers)

            return res.json({
                message: "Attempt submitted",
                userScore,
                maxScore
            })

        } catch (error) {
            next(error)
        }
    }
}
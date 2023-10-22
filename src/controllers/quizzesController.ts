import { Request, Response } from "express"
import asyncHandler from "express-async-handler"

import { TypedRequest } from "../types/global"
import { IQuizRequestBody } from "../types/quizTypes"

import { quizSchema } from "../types/quizTypes"
import { PrismaClient } from "@prisma/client"

// @desc create new qiuz
// @route /quizzes/createQuiz
// @access Private
export const getCreateQuizController = ({prisma}: {prisma: PrismaClient}) => {

    return asyncHandler(async (req: TypedRequest<IQuizRequestBody>, res: Response) => {
    
        const { title, questions } = req.body
    
        if (!title || !questions) {
            res.status(400)
            throw new Error("Please add all required fields")
        }
    
        const validatedQuiz = quizSchema.safeParse({
            title,
            questions
        })
    
        if (!validatedQuiz.success) {
            console.log(validatedQuiz.error.errors)
            res.status(400)
            throw new Error("Invalid quiz data")
        }
    
        const { title: validatedTitle, questions: validatedQuestions } = validatedQuiz.data
    
        try {
            if(!req.userId) {
                throw new Error('Author doesnt exist')
            }
            const quiz = await prisma.quizzes.create({
                data: {
                    title: validatedTitle,
                    author: req.userId,
                    duration: 30,
                    questions: validatedQuestions
                }
            })
    
            res.status(201).json({
                message: "Quiz added",
                quizId: quiz.id
            })
    
        } catch (error) {
            res.status(500)
            throw new Error('Internal server error')
        }
    })
}

// @desc returns list of quizzes
// @route /quizzes/getQuizzes
// @access Public
export const getQuizzesController = ({prisma}: {prisma: PrismaClient}) => {
    return asyncHandler(async (req: Request, res: Response) => {
    
        let quizzesWithAuthors;
        try {
            quizzesWithAuthors = await prisma.quizzes.findMany({
                select: {id: true, title:true, duration:true, users: { 
                    select: {id: true, nickname: true} 
                }} 
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
    })
}
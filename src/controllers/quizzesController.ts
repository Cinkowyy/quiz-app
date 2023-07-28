import { Response } from "express"
import asyncHandler from "express-async-handler"

import { TypedRequest } from "../types/global"
import { IQuizRequestBody } from "../types/quizTypes"

import Quiz from "../models/Quiz"
import { quizSchema } from "../types/quizTypes"

// @desc create new qiuz
// @route /quizzes/createQuiz
// @access Private
export const createQuiz = asyncHandler(async (req: TypedRequest<IQuizRequestBody>, res: Response) => {

    const { title, questions } = req.body

    if (!title || !questions) {
        res.status(400)
        throw new Error("Please add all required fields")
    }

    const validatedQuiz = quizSchema.safeParse({
        title,
        questions
    })

    if(!validatedQuiz.success) {
        console.log(validatedQuiz.error.errors)
        res.status(400)
        throw new Error("Invalid quiz data")
    }

    const {title: validatedTitle, questions: validatedQuestions} = validatedQuiz.data
    
    //Validate this in future

    // if(Object.keys(validatedQuestions).length < 5) {
    //     res.status(400)
    //     throw new Error("The quiz must have at least 5 questions")
    // }

    const quiz = await Quiz.create({
        title: validatedTitle,
        questions: validatedQuestions,
        author: req.userId
    })

    if(quiz) {
        res.status(201)
        res.json({
            message: "Quiz added",
            quizId: quiz._id
        })
    } else {
        res.status(400)
        throw new Error('Invalid quiz data or DB is down')
    }

})
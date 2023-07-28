import { Response } from "express"
import asyncHandler from "express-async-handler"
import { Error } from "mongoose"

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

    try{
        const quiz = await Quiz.create({
            title: validatedTitle,
            questions: validatedQuestions,
            author: req.userId
        })

        res.status(201).json({
            message: "Quiz added",
            quizId: quiz._id
        })
        
    } catch(error) {

        if(error instanceof Error.ValidationError) {
            console.log(error.errors)
            res.status(400)
            throw new Error('Invalid quiz data')
        } else {
            res.status(500)
            throw new Error('Internal server error')
        }
    }

})
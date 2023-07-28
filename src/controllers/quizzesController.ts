import { Response } from "express"
import asyncHandler from "express-async-handler"

import { TypedRequest } from "../types/global"
import { IQuizRequestBody } from "../types/quizTypes"

import Quiz from "../models/Quiz"

// @desc create new qiuz
// @route /quizzes/createQuiz
// @access Private
export const createQuiz = asyncHandler(async (req: TypedRequest<IQuizRequestBody>, res: Response) => {

    const { title, questions } = req.body

    if (!title || !questions || typeof questions !== "object") {
        res.status(400)
        throw new Error("Please add all required fields")
    }

    if(Object.keys(questions).length < 1) {
        res.status(400)
        throw new Error("The quiz must have at least 1 question")
    }

    const quiz = await Quiz.create({
        title,
        questions,
        author: req.userId
    })

    if(quiz) {
        console.log(quiz)
        res.status(201)
        res.json({
            message: "Quiz added"
        })
    } else {
        res.status(400)
        throw new Error('Invalid quiz data')
    }

})
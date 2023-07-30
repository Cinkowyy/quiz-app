import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { Error } from "mongoose"

import { TypedRequest } from "../types/global"
import { IQuizRequestBody } from "../types/quizTypes"

import User from "../models/User"
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

    if (!validatedQuiz.success) {
        console.log(validatedQuiz.error.errors)
        res.status(400)
        throw new Error("Invalid quiz data")
    }

    const { title: validatedTitle, questions: validatedQuestions } = validatedQuiz.data

    //Validate this in future

    // if(Object.keys(validatedQuestions).length < 5) {
    //     res.status(400)
    //     throw new Error("The quiz must have at least 5 questions")
    // }

    try {
        const quiz = await Quiz.create({
            title: validatedTitle,
            questions: validatedQuestions,
            author: req.userId
        })

        res.status(201).json({
            message: "Quiz added",
            quizId: quiz._id
        })

    } catch (error) {

        if (error instanceof Error.ValidationError) {
            console.log(error.errors)
            res.status(400)
            throw new Error('Invalid quiz data')
        } else {
            res.status(500)
            throw new Error('Internal server error')
        }
    }

})

// @desc returns list of quizzes
// @route /quizzes/getQuizzes
// @access Public
export const getQuizzes = asyncHandler(async (req: Request, res: Response) => {

    let quizzesWithAuthors;

    try {
        quizzesWithAuthors = await Quiz.aggregate([
            { $project: { _id: 1, title: 1, questions: 1, author: 1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorInfo",
                },
            },
            {
                $addFields: {
                    author: {
                        $arrayElemAt: [
                            {
                                $map: {
                                    input: "$authorInfo",
                                    as: "author",
                                    in: {
                                        _id: "$$author._id",
                                        nickname: "$$author.nickname",
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $project: {
                    authorInfo: 0,
                },
            },
        ]);
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
import { ObjectId } from "mongoose"

export interface IQuizQuestion {
    content: string
    answers: {
        [key: number]: string
    }
    correctAnswer: number
}

export interface IQuiz {
    title: string
    questions: {
        [key: number]: IQuizQuestion
    }
    author: ObjectId
}

export interface IQuizRequestBody {
    title?: string
    questions?: {
        [key: number]: IQuizQuestion
    }
}

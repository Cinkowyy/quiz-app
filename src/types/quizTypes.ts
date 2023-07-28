import { ObjectId } from "mongoose";
import { z } from "zod";

export const quizSchema = z.object({
    title: z.string(),
    questions: z.record(z.string(), z.object({
        content: z.string(),
        answers: z.record(z.string(), z.string())
            .refine((data) => Object.keys(data).length > 1, {
                message: "Answers record must have at least 2 answers",
            }),
        correctAnswer: z.string()
    })).refine((data) => Object.keys(data).length > 0, {
        message: "Record must not be empty",
    }),
})

type quizType = z.infer<typeof quizSchema>;

export interface IQuiz extends quizType {
    author: ObjectId
}

export type IQuizRequestBody = Partial<quizType>

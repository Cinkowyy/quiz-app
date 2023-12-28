import { z } from "zod";

export const quizValidationSchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "Title is required"
        }),
        categoryId: z.string(),
        duration: z.number(),
        visibility: z.enum(['public', 'private']),
        questions: z.array(z.object({
            content: z.string(),
            type: z.enum(['single', 'multi']),
            answers: z.array(z.object({
                content: z.string(),
                isCorrect: z.boolean()
            })).refine((data) => Object.keys(data).length > 1, {
                message: "Answers record must have at least 2 answers",
            }),
        })).refine((data) => Object.keys(data).length > 0, {
            message: "Record must not be empty",
        }),
    })
})

export type QuizRequestBody = z.infer<typeof quizValidationSchema>['body'];

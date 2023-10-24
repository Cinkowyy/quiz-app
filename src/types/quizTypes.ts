import { z } from "zod";

export const quizSchema = z.object({
    title: z.string({
        required_error: "Title is required"
      }),
    duration: z.number(),
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

type quizType = z.infer<typeof quizSchema>;

export type IQuizRequestBody = Partial<quizType>

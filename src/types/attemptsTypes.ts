import { z } from "zod";

export const beginAttemptValidationSchema = z.object({
    body: z.object({
        quizId: z.string()
    })
})

export const submitAttemptValidationSchema = z.object({
    body: z.object({
        attemptId: z.string()
    })
})

export const submitAnswerValidationSchema = z.object({
    body: z.object({
        attemptId: z.string(),
        questionId: z.string(),
        answerId: z.string(),
    })
})

export const submitGuestAttemptValidationSchema = z.object({
    body: z.object({
        quizId: z.string(),
        answers: z.array(z.object({
            questionId: z.string(),
            answerId: z.string()
        }))
    })
})

export type BeginAttemptBody = z.infer<typeof beginAttemptValidationSchema>['body']
export type SubmitAttemptBody = z.infer<typeof submitAttemptValidationSchema>['body']
export type SubmitAnswerBody = z.infer<typeof submitAnswerValidationSchema>['body']
export type SubmitGuestAttemptBody = z.infer<typeof submitGuestAttemptValidationSchema>['body']
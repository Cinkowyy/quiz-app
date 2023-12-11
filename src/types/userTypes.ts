import { z } from "zod";

export const registerValidationSchema = z.object({
    body: z.object({
        nickname: z.string(),
        email: z.string().email(),
        password: z.string()
    })
})

export const loginValidationSchema = z.object({
    body: z.object({
        email: z.string(),
        password: z.string()
    })
})

export const logoutValidationSchema = z.object({
    body: z.object({
        refreshToken: z.string()
    })
})

export const refreshValidationSchema = z.object({
    body: z.object({
        refreshToken: z.string()
    })
})

export type UserRegisterBody = z.infer<typeof registerValidationSchema>['body']
export type UserLoginBody = z.infer<typeof loginValidationSchema>['body']
export type UserLogoutBody = z.infer<typeof logoutValidationSchema>["body"] 
export type RefreshBody = z.infer<typeof refreshValidationSchema>["body"] 

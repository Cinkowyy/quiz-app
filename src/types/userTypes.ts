import { z } from "zod";

export const registerSchema = z.object({
    nickname: z.string(),
    email: z.string().email(),
    password: z.string()
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export type IUserRegisterBody = z.infer<typeof registerSchema>
export type IUserLoginBody = z.infer<typeof loginSchema> 

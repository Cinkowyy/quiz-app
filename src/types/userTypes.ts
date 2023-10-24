import { z } from "zod";

const userSchema = z.object({
    nickname: z.string(),
    email: z.string().email(),
    password: z.string()
})

export const registerValidationSchema = z.object({
    body: userSchema
})

export type IUserRegisterBody = z.infer<typeof userSchema>

export type ILoggingUser = Partial<Omit<IUserRegisterBody, "nickname">>
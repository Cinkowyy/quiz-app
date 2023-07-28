import { z } from "zod";

export const userSchema = z.object({
    nickname: z.string(),
    email: z.string().email(),
    password: z.string()
})
export type IUser = z.infer<typeof userSchema>

export type IUserRequestBody = Partial<IUser>

export type ILoggingUser = Omit<IUserRequestBody, "nickname">
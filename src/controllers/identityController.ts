import { Request, Response } from "express"
import asyncHandler from "express-async-handler"

export const getUser = asyncHandler( async (req: Request, res: Response) => {
    res.send("Użytkownicy")
})
export const register = asyncHandler( async (req: Request, res: Response) => {
    res.send("Rejestracja")
})
export const login = asyncHandler( async (req: Request, res: Response) => {
    res.send("Logowanie")
})
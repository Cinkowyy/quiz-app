import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { TypedRequest } from "../types/global"
import { IUserRequestBody, ILoggingUser, userSchema } from "../types/userTypes"
import { PrismaClient } from "@prisma/client"

// @desc Register user
// @route /identity/register
// @access Public
export const getRegisterController = ({ prisma }: { prisma: PrismaClient }) => {

    return asyncHandler(async (req: TypedRequest<IUserRequestBody>, res: Response, next: NextFunction) => {
        const { nickname, email, password } = req.body;

        if (!nickname || !email || !password) {
            res.status(400)
            throw new Error("Please add all required fields")
        }

        const validatedUser = userSchema.safeParse({
            nickname,
            email,
            password
        })

        if (!validatedUser.success) {
            console.log(validatedUser.error.errors)
            res.status(400)
            throw new Error("Invalid user data")
        }

        // Check if user exists
        const userExists = await prisma.users.findFirst({ where: { email } })

        if (userExists) {
            res.status(400)
            throw new Error("User already exists")
        }

        //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user

        try {
            await prisma.users.create({
                data: {
                    nickname,
                    email,
                    password: hashedPassword
                }
            })
            res.status(200).json({
                message: "User created succesfully"
            })

        } catch (error) {
            next(error);
        }
    })
}

// @desc Login user
// @route /identity/login
// @access Public
export const getLoginController = ({ prisma, jwtSecret }: { prisma: PrismaClient, jwtSecret: string }) => {

    return asyncHandler(async (req: TypedRequest<ILoggingUser>, res: Response) => {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400)
            throw new Error("Please add all required fields")
        }

        const user = await prisma.users.findFirst({ where: { email } })

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(201).json({
                accessToken: generateJwtToken(user.id, jwtSecret)
            })
        } else {
            res.status(400)
            throw new Error('Invalid credentials')
        }
    })
}

// @desc get logged in user data
// @route /identity/getUser
// @access Private
export const getUserController = ({ prisma }: { prisma: PrismaClient }) => {

    return asyncHandler(async (req: Request, res: Response) => {
        const userId = req?.userId

        if(!userId) {
            throw new Error("No user id in request")
        }
        
        const user = await prisma.users.findFirst({
            where: { id: userId },
            select: { email: true, nickname: true }
        })
        res.json(user)
    })
}

//Generate JWT
const generateJwtToken = (userID: string, jwtSecret: string) => {
    return Jwt.sign({
        sub: userID
    },
    jwtSecret,
    {
        expiresIn: '1d'
    })
}
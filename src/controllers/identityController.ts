import { NextFunction, Response } from "express"
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { IUserLoginBody, IUserRegisterBody } from "../types/userTypes"
import { PrismaClient } from "@prisma/client"
import { AuthorizedRequest, TypedRequest } from "../types/typedRequests"

export const getRegisterController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<IUserRegisterBody>, res: Response, next: NextFunction) => {

        try {
            const { nickname, email, password } = req.body;

            // Check if user exists
            const userExists = await prisma.users.findFirst({ where: { email } })

            if (userExists) {
                return res.status(400).json({
                    message: "User already exists"
                })
            }

            //Hash password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            // Create user
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
    }
}

export const getLoginController = ({ prisma, jwtSecret }: { prisma: PrismaClient, jwtSecret: string }) => {

    return async (req: TypedRequest<IUserLoginBody>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            const user = await prisma.users.findFirst({ where: { email } })

            if (!user) {
                return res.status(400).json({
                    message: 'Invalid credentials'
                })
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)

            if (!isPasswordValid) {
                return res.status(400).json({
                    message: 'Invalid credentials'
                })
            }

            res.status(201).json({
                accessToken: generateJwtToken(user.id, jwtSecret)
            })

        } catch (error) {
            next(error)
        }
    }
}

export const getUserController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req?.userId

            if (!userId) {
                throw new Error("No user id in request")
            }

            const user = await prisma.users.findFirst({
                where: { id: userId },
                select: { email: true, nickname: true }
            })
            res.json(user)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
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
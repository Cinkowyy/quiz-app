import { NextFunction, Response } from "express"
import crypto from "crypto";

import { IUserLoginBody, IUserRegisterBody } from "../types/userTypes"
import { PrismaClient } from "@prisma/client"
import { AuthorizedRequest, TypedRequest } from "../types/typedRequests"
import { getHashedPassword } from "../utils/passwordManager"
import { createSession } from "../utils/sessionManager";
import { JwtInfo } from "../utils/jwtInfo";

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

            //hash password
            const salt = crypto.randomBytes(16).toString("hex");
            const iterations = 600000;
            const hashedPassword = getHashedPassword({
              password,
              salt,
              iterations,
            });
    
            // Create user
            await prisma.users.create({
                data: {
                    nickname,
                    email,
                    password: hashedPassword,
                    salt,
                    iterations
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

export const getLoginController = ({ prisma, jwtInfo}: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    return async (req: TypedRequest<IUserLoginBody>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            const user = await prisma.users.findFirst({ where: { email } })

            if (!user) {
                return res.status(400).json({
                    message: 'Invalid credentials'
                })
            }

            const hashedPassword = getHashedPassword({
                password,
                salt: user.salt,
                iterations: user.iterations,
              });

            if (hashedPassword !== user.password) {
                return res.status(400).json({
                    message: 'Invalid credentials'
                })
            }

            const {accessToken, refreshToken} =  await createSession({
                prisma,
                userId: user.id,
                jwtInfo
            })

            res.status(201).json({
                accessToken,
                refreshToken
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
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}
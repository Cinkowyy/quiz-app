import { NextFunction, Response } from "express"
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { RefreshBody, UserLoginBody, UserLogoutBody, UserRegisterBody } from "../types/userTypes"
import { PrismaClient } from "@prisma/client"
import { AuthorizedRequest, TypedRequest } from "../types/typedRequests"
import { getHashedPassword } from "../utils/passwordManager"
import { createSession } from "../utils/sessionManager";
import { JwtInfo } from "../utils/jwtInfo";
import errorResponse from "../utils/errorResponse";

export const getRegisterController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<UserRegisterBody>, res: Response, next: NextFunction) => {

        try {
            const { nickname, email, password } = req.body;

            // Check if user exists
            const userExists = await prisma.users.findFirst({ where: { email } })

            if (userExists) {
                return errorResponse({
                    response: res,
                    status: 400,
                    message: "User already exists",
                    error: "UserExists"
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

export const getLoginController = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    return async (req: TypedRequest<UserLoginBody>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            const user = await prisma.users.findFirst({ where: { email } })

            if (!user) {
                return errorResponse({
                    response: res,
                    status: 400,
                    message: "Invalid credentials",
                    error: "InvalidCredentials"
                })
            }

            const hashedPassword = getHashedPassword({
                password,
                salt: user.salt,
                iterations: user.iterations,
            });

            if (hashedPassword !== user.password) {
                return errorResponse({
                    response: res,
                    status: 400,
                    message: "Invalid credentials",
                    error: "InvalidCredentials"
                })
            }

            const { accessToken, refreshToken } = await createSession({
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

            if (!userId) throw new Error("Missing userId in auth")

            const user = await prisma.users.findFirst({
                where: { id: userId },
                select: { email: true, nickname: true }
            })
            res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    }
}

export const getLogoutController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<UserLogoutBody>, res: Response, next: NextFunction) => {

        try {

            const { refreshToken } = req.body;

            const decoded = jwt.decode(refreshToken) as {
                sub: string;
                jti: string;
            };

            if (!decoded || !decoded.sub || !decoded.jti) {
                return errorResponse({
                    response: res,
                    status: 401,
                    message: "Invalid refresh token",
                    error: "InvalidRefreshToken"
                })
            }

            const session = await prisma.sessions.findFirst({
                select: {
                    id: true,
                    secret: true,
                },
                where: {
                    id: decoded.jti,
                    userId: decoded.sub,
                },
            });

            if (!session) {
                return errorResponse({
                    response: res,
                    status: 404,
                    message: "Session not found",
                    error: "SessionNotFound"
                })
            }

            await prisma.sessions.delete({
                where: {
                    id: session.id,
                    userId: decoded.sub
                }
            })

            return res.sendStatus(204)

        } catch (error) {
            next(error)
        }
    }
}

export const getRefreshController = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    return async (req: TypedRequest<RefreshBody>, res: Response, next: NextFunction) => {

        try {
            const { refreshToken } = req.body;

            const decoded = jwt.decode(refreshToken) as {
                sub: string;
                jti: string;
            };

            if (!decoded || !decoded.sub || !decoded.jti) {
                return errorResponse({
                    response: res,
                    status: 401,
                    message: "Invalid refresh token",
                    error: "InvalidRefreshToken"
                })
            }

            const session = await prisma.sessions.findFirst({
                select: {
                    id: true,
                    secret: true,
                },
                where: {
                    id: decoded.jti,
                    userId: decoded.sub,
                },
            });

            if (!session) {
                return errorResponse({
                    response: res,
                    status: 404,
                    message: "Session not found",
                    error: "SessionNotFound"
                })
            }

            try {
                jwt.verify(refreshToken, session.secret)
            } catch (error) {
                return errorResponse({
                    response: res,
                    status: 401,
                    message: "Invalid refresh token",
                    error: "InvalidRefreshToken"
                })
            }

            const user = await prisma.users.findFirst({
                select: {
                    id: true
                },
                where: {
                    id: decoded.sub
                }
            })

            if (!user) {
                return errorResponse({
                    response: res,
                    status: 404,
                    message: "User not found",
                    error: "UserNotFound"
                })
            }

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await createSession({
                prisma,
                userId: user.id,
                jwtInfo
            })

            res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })

            prisma.sessions.delete({
                where: {
                    id: session.id,
                    userId: decoded.sub
                }
            }).catch(error => {
                console.error(error)
            })

        } catch (error) {
            next(error)
        }
    }
}
import { NextFunction, Response } from "express"
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { RefreshBody, UserLoginBody, UserLogoutBody, UserRegisterBody } from "../types/userTypes"
import { PrismaClient } from "@prisma/client"
import { AuthorizedRequest, TypedRequest } from "../types/typedRequests"
import { getHashedPassword } from "../utils/passwordManager"
import { createSession } from "../utils/sessionManager";
import { JwtInfo } from "../utils/jwtInfo";

export const getRegisterController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<UserRegisterBody>, res: Response, next: NextFunction) => {

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

export const getLoginController = ({ prisma, jwtInfo }: { prisma: PrismaClient, jwtInfo: JwtInfo }) => {

    return async (req: TypedRequest<UserLoginBody>, res: Response, next: NextFunction) => {
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

            if (!userId) {
                console.error("No userId from auth")
                return res.status(500).json({
                    message: "Missing userId in auth"
                })
            }

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
                return res.status(401).json({
                    message: "Refresh token is invalid"
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
                return res.status(404).json({
                    message: "Session not found"
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
                return res.status(401).json({
                    message: "Refresh token is invalid"
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
                return res.status(404).json({
                    message: "Session not found"
                })
            }

            try {
                jwt.verify(refreshToken, session.secret)
            } catch (error) {
                return res.status(401).json({
                    message: "Refresh token is invalid"
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
                return res.status(404).json({
                    message: "User not found"
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
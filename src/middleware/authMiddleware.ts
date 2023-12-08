import Jwt from 'jsonwebtoken'
import { NextFunction, Response } from "express"
import { AuthorizedRequest } from '../types/typedRequests'
import errorResponse from '../utils/errorResponse'

const getAuthorization = ({ jwtSecret }: { jwtSecret: string }) => {
    return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {

        try {

            if (!req.headers.authorization) {
                return errorResponse({
                    response: res,
                    status: 401,
                    message: "Missing Authorization header",
                    error: "MissingHeader"
                })
            }

            if (!req.headers.authorization.startsWith("Bearer")) {
                return errorResponse({
                    response: res,
                    status: 401,
                    message: "Invalid Authorization header",
                    error: "InvalidHeader"
                })
            }

            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return errorResponse({
                    response: res,
                    status: 401,
                    message: "Unauthorized, missing token",
                    error: "MissingToken"
                })
            }

            // Verify token
            const decoded = Jwt.verify(token, jwtSecret) as {
                sub: string
            };

            req.userId = decoded.sub;

            next()
        } catch (error) {
            console.log(error)
            return errorResponse({
                response: res,
                status: 401,
                message: "Unauthorized, other error",
                error: "Unauhorized"
            })
        }

    }
}

export default getAuthorization
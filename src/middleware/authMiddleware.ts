import Jwt from 'jsonwebtoken'
import { NextFunction, Response } from "express"
import { AuthorizedRequest } from '../types/typedRequests'

const getAuthorization = ({ jwtSecret }: { jwtSecret: string }) => {
    return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {

        try {

            if (!req.headers.authorization) {
                return res.status(401).json({
                    message: "Missing Authorization header"
                })

            }

            if (!req.headers.authorization.startsWith("Bearer")) {
                return res.status(401).json({
                    message: "Invalid Authorization header"
                })
            }

            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(401).json({
                    message: "Unauthorized, missing token"
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
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }

    }
}

export default getAuthorization
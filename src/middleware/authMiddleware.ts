import Jwt from 'jsonwebtoken'
import { NextFunction, Response } from "express"
import { IJwtTokenPayload } from '../types/jwtTokenPayloadTypes'
import { AuthorizedRequest } from '../types/typedRequests'

const getAuthorization = ({ jwtSecret }: { jwtSecret: string }) => {
    return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {

        try {

            if (!req.headers.authorization) {
                res.status(401)
                throw new Error("Missing Authorization header")
            }
    
            if (!req.headers.authorization.startsWith("Bearer")) {
                res.status(401)
                throw new Error("Invalid Authorization header")
            }
    
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                res.status(401)
                throw new Error("Unauthorized, missing token")
            }

            // Verify token
            const decoded = Jwt.verify(token, jwtSecret) as IJwtTokenPayload;

            req.userId = decoded.sub;

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error("Unauthorized")
        }

    }
}

export default getAuthorization
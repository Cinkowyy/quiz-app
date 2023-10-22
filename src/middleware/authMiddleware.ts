import Jwt from 'jsonwebtoken'
import asyncHandler from "express-async-handler"
import { NextFunction, Response } from "express"
import { IJwtTokenPayload } from '../types/jwtTokenPayloadTypes'
import { RequestWithUserId } from '../types/typedRequests'

const getAuthorization = ({jwtSecret}: {jwtSecret: string}) => {
    return asyncHandler(async (req: RequestWithUserId , res: Response, next: NextFunction) => {

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
    
        try {
    
            // Verify token
            const decoded = Jwt.verify(token, jwtSecret) as IJwtTokenPayload;
    
            req.userId = decoded.sub;
    
            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error("Unauthorized")
        }
    
    })
}

export default getAuthorization
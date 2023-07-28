import Jwt from 'jsonwebtoken'
import asyncHandler from "express-async-handler"
import { NextFunction, Request, Response } from "express"
import { IJwtTokenPayload } from '../types/global'

import User from '../models/User'

const authorization = asyncHandler(async (req:Request , res: Response, next: NextFunction) => {

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
        const decoded = Jwt.verify(token, process.env.JWT_SECRET) as IJwtTokenPayload;

        const user = await User.findById(decoded.id)
       
        if(!user) {
            throw new Error("User not exists")
        }

        req.userId = decoded.id;

        next()
    } catch (error) {
        console.log(error)
        res.status(401)
        throw new Error("Unauthorized")
    }

})

export default authorization
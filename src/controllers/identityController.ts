import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { TypedRequest } from "../types/global"
import { IUserRequestBody, ILoggingUser, userSchema } from "../types/userTypes"
import User from "../models/User"
import { Error } from "mongoose"

// @desc Register user
// @route /identity/register
// @access Public
export const register = asyncHandler(async (req: TypedRequest<IUserRequestBody>, res: Response) => {
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

    if(!validatedUser.success) {
        console.log(validatedUser.error.errors)
        res.status(400)
        throw new Error("Invalid user data")
    }

    // Check if user exists
    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error("User already exists")
    }

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user

    try {
        const user = await User.create({
            nickname,
            email,
            password: hashedPassword
        })
        res.status(200).json({
            message: "User created succesfully"
        })
        
    } catch (error) {
        if(error instanceof Error.ValidationError) {
            console.log(error.errors)
            res.status(400)
            throw new Error('Invalid user data')
        } else {
            res.status(500)
            throw new Error('Internal server error')
        }
    }
})

// @desc Login user
// @route /identity/login
// @access Public
export const login = asyncHandler(async (req: TypedRequest<ILoggingUser>, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error("Please add all required fields")
    }

    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(201).json({
            accessToken: generateJwtToken(user.id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
})

// @desc get logged in user data
// @route /identity/getUser
// @access Private
export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req?.userId).select('-password')
    res.json(user)
})

//Generate JWT
const generateJwtToken = (userID: string) => {
    return Jwt.sign({
        id: userID
    }, 
    process.env.JWT_SECRET,
    {
        expiresIn: '2d'
    })
}
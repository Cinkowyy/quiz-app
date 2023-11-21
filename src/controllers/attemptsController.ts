import { PrismaClient } from "@prisma/client";
import { TypedRequest } from "../types/typedRequests";
import { NextFunction, Response } from "express";

export const getBeginAttemptController = ({ prisma }: { prisma: PrismaClient }) => {
    return async (req: TypedRequest<any>, res: Response, next: NextFunction) => {

        const userId = req.userId
        try {
            return res.json({
               attemptId: 'id here'   
            })
        } catch (error) {
            next(error)
        }
    }
}
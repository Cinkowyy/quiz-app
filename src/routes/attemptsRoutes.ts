import { Router } from "express";

import { PrismaClient } from "@prisma/client";
import { JwtInfo } from "../utils/jwtInfo";
import { getBeginAttemptController, getSubmitAnswerController, getSubmitAttemptController } from "../controllers/attemptsController";
import getAuthorization from "../middleware/authMiddleware";
import validation from "../middleware/validationMiddleware";
import { beginAttemptValidationSchema, submitAnswerValidationSchema, submitAttemptValidationSchema } from "../types/attemptsTypes";

const getAttemptsRoutes = ({ prisma, jwtInfo, }: { prisma: PrismaClient; jwtInfo: JwtInfo; }) => {
    const router = Router();

    router.post(
        "/beginAttempt",
        getAuthorization({ jwtSecret: jwtInfo.secret }),
        validation(beginAttemptValidationSchema),
        getBeginAttemptController({ prisma })
    );
    router.post(
        "/submitAttempt",
        getAuthorization({ jwtSecret: jwtInfo.secret }),
        validation(submitAttemptValidationSchema),
        getSubmitAttemptController({ prisma })
    );

    router.post(
        "/submitAnswer",
        getAuthorization({ jwtSecret: jwtInfo.secret }),
        validation(submitAnswerValidationSchema),
        getSubmitAnswerController({ prisma })
    );

    return router;
};

export default getAttemptsRoutes;
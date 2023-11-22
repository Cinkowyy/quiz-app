import { PrismaClient } from "@prisma/client";
import crypto from "crypto"
import { quizzes, users } from "./dataToSeed";
import { UserRegisterBody } from "../types/userTypes";
import { getHashedPassword } from "../utils/passwordManager";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

const createUsers = async (users: UserRegisterBody[]) => {

    const mappedUsers = users.map((user) => {
        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600000;
        const hashedPassword = getHashedPassword({
            password: user.password,
            salt,
            iterations,
        });

        const mappedUser = {
            ...user,
            salt,
            iterations,
            hashedPassword
        }

        return mappedUser
    })

    const createdUsers = await prisma.$transaction(
        mappedUsers.map((user) => prisma.users.create({
            data: {
                nickname: user.nickname,
                email: user.email,
                password: user.hashedPassword,
                salt: user.salt,
                iterations: user.iterations
            },
            select: {
                id: true
            }
        })),
    );

    return createdUsers
}

// createUsers(users)
import { PrismaClient } from "@prisma/client";
import crypto from "crypto"
import fs from "fs"
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
            password: hashedPassword,
            salt,
            iterations
        }

        return mappedUser
    })

    const createdUsers = await prisma.$transaction(
        mappedUsers.map((user) => prisma.users.create({
            data: user,
            select: {
                id: true
            }
        })),
    );

    return createdUsers
}

const seedDB = async () => {
    try {
        const createdUsersIds = await createUsers(users)

        const mappedQuizzes = quizzes.map((quiz) => {
            const authorIndex = parseInt(quiz.author)

            return {
                ...quiz,
                author: createdUsersIds[authorIndex]['id']
            }
        })

        const createdQuizzes = await prisma.$transaction(async tx => {

            return Promise.all(mappedQuizzes.map(async (quiz) => {
                const createdQuiz = await tx.quizzes.create({
                    data: {
                        title: quiz.title,
                        author: quiz.author,
                        duration: quiz.duration,
                    },
                    select: {
                        id: true
                    }
                })

                const questions = await Promise.all(quiz.questions.map(async (question) => {

                    return await tx.questions.create({
                        data: {
                            content: question.content,
                            quizId: createdQuiz.id,
                            type: question.type,
                            answers: {
                                createMany: {
                                    data: question.answers.map((answer) => ({
                                        content: answer.content,
                                        isCorrect: answer.isCorrect
                                    }))
                                }
                            }
                        },
                        select: {
                            id: true,
                            type: true,
                            answers: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    })
                }));

                return {
                    ...createdQuiz,
                    questions
                }
            }))
        })

        fs.writeFileSync('./src/data/seededQuizzes.json', JSON.stringify(createdQuizzes))

    } catch (error) {
        console.error(error)
    }
}

seedDB()
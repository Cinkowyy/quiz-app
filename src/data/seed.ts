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

        const createdQuizzesIds = await prisma.$transaction(async tx => {

            const createdQuizzesIds = Promise.all(mappedQuizzes.map(async (quiz) => {
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

                await Promise.all(quiz.questions.map(async (question) => {

                    await tx.questions.create({
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
                        }
                    })
                }));

                return createdQuiz['id']
            }))

            return createdQuizzesIds
        })

        console.log(createdQuizzesIds);

    } catch (error) {
        console.error(error)
    }
}

seedDB()
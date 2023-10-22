-- CreateTable
CREATE TABLE `answers` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `questionId` VARCHAR(36) NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `answers_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `quizId` VARCHAR(36) NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `type` ENUM('single', 'multi') NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `questions_quizId_idx`(`quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(36) NOT NULL,
    `duration` INTEGER NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `quizzes_author_idx`(`author`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userAnswers` (
    `attemptId` VARCHAR(36) NOT NULL,
    `questionId` VARCHAR(36) NOT NULL,
    `answerId` VARCHAR(36) NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userAnswers_answerId_idx`(`answerId`),
    INDEX `userAnswers_questionId_idx`(`questionId`),
    INDEX `userAnswers_attemptId_idx`(`attemptId`),
    PRIMARY KEY (`attemptId`, `questionId`, `answerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userAttempts` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `userId` VARCHAR(36) NOT NULL,
    `quizId` VARCHAR(36) NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userAttempts_userId_idx`(`userId`),
    INDEX `userAttempts_quizId_idx`(`quizId`),
    INDEX `userAttempts_userId_quizId_idx`(`userId`, `quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `nickname` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `userId` VARCHAR(36) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`author`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `userAnswers` ADD CONSTRAINT `userAnswers_ibfk_1` FOREIGN KEY (`attemptId`) REFERENCES `userAttempts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `userAnswers` ADD CONSTRAINT `userAnswers_ibfk_2` FOREIGN KEY (`answerId`) REFERENCES `answers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `userAnswers` ADD CONSTRAINT `userAnswers_ibfk_3` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `userAttempts` ADD CONSTRAINT `userAttempts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

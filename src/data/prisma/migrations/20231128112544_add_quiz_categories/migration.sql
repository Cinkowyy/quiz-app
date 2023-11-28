/*
  Warnings:

  - Added the required column `categoryId` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `categoryId` VARCHAR(36) NOT NULL;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

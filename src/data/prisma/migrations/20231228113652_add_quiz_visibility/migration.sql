-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `visibility` ENUM('public', 'private') NOT NULL DEFAULT 'public';

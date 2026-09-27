-- AlterTable
ALTER TABLE `Project` ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `coverImage` VARCHAR(191) NULL,
    ADD COLUMN `gallery` JSON NULL;

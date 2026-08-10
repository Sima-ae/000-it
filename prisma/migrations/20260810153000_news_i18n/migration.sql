-- AlterTable
ALTER TABLE `NewsPost`
  ADD COLUMN `titleNl` VARCHAR(191) NULL,
  ADD COLUMN `excerptNl` TEXT NULL,
  ADD COLUMN `descriptionNl` LONGTEXT NULL;

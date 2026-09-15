-- AlterTable
ALTER TABLE `NewsPost` ADD COLUMN `deletedAt` DATETIME(3) NULL;
ALTER TABLE `NewsPost` ADD COLUMN `deletedReason` VARCHAR(191) NULL;
ALTER TABLE `NewsPost` ADD COLUMN `retentionExempt` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `NewsPost_deletedAt_idx` ON `NewsPost`(`deletedAt`);

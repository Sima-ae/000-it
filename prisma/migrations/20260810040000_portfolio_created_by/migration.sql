-- AlterTable
ALTER TABLE `PortfolioProject` ADD COLUMN `createdById` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `PortfolioProject_createdById_idx` ON `PortfolioProject`(`createdById`);

-- AddForeignKey
ALTER TABLE `PortfolioProject` ADD CONSTRAINT `PortfolioProject_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

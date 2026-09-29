-- AlterTable
ALTER TABLE `ShopOrder` ADD COLUMN `sourceBrand` VARCHAR(191) NULL,
    ADD COLUMN `sourceHost` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DomainOrder` ADD COLUMN `sourceBrand` VARCHAR(191) NULL,
    ADD COLUMN `sourceHost` VARCHAR(191) NULL;

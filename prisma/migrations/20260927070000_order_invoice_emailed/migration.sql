-- AlterTable
ALTER TABLE `ShopOrder` ADD COLUMN `invoiceEmailedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `DomainOrder` ADD COLUMN `invoiceEmailedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `DomainProduct` ADD COLUMN `transferBasePriceInCents` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `DomainProduct` ADD COLUMN `restoreBasePriceInCents` INTEGER NOT NULL DEFAULT 0;

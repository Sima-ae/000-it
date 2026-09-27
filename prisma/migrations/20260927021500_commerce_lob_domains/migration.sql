-- AlterTable ShopCatalogProduct
ALTER TABLE `ShopCatalogProduct` ADD COLUMN `lineOfBusiness` ENUM('SERVICE', 'HOSTING') NOT NULL DEFAULT 'SERVICE';

-- AlterTable ShopOrder
ALTER TABLE `ShopOrder` ADD COLUMN `lineOfBusiness` ENUM('SERVICE', 'HOSTING') NOT NULL DEFAULT 'SERVICE';

-- AlterTable ShopOrderItem
ALTER TABLE `ShopOrderItem` ADD COLUMN `lineOfBusiness` ENUM('SERVICE', 'HOSTING') NOT NULL DEFAULT 'SERVICE';

-- CreateIndex
CREATE INDEX `ShopCatalogProduct_lineOfBusiness_published_sortOrder_idx` ON `ShopCatalogProduct`(`lineOfBusiness`, `published`, `sortOrder`);

-- CreateIndex
CREATE INDEX `ShopOrder_lineOfBusiness_createdAt_idx` ON `ShopOrder`(`lineOfBusiness`, `createdAt`);

-- CreateTable
CREATE TABLE `DomainProduct` (
    `id` VARCHAR(191) NOT NULL,
    `tld` VARCHAR(191) NOT NULL,
    `basePriceInCents` INTEGER NOT NULL,
    `markupFixedCents` INTEGER NOT NULL DEFAULT 0,
    `markupPercent` DOUBLE NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DomainProduct_tld_key`(`tld`),
    INDEX `DomainProduct_isActive_tld_idx`(`isActive`, `tld`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DomainOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `domainName` VARCHAR(191) NOT NULL,
    `years` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('PENDING', 'PAID', 'REGISTERED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `stripeSessionId` VARCHAR(191) NULL,
    `totalPriceInCents` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'nl',
    `registrantJson` TEXT NOT NULL,
    `namecheapResponse` LONGTEXT NULL,
    `domainProductId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DomainOrder_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `DomainOrder_stripeSessionId_key`(`stripeSessionId`),
    INDEX `DomainOrder_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `DomainOrder_email_idx`(`email`),
    INDEX `DomainOrder_domainName_idx`(`domainName`),
    INDEX `DomainOrder_domainProductId_idx`(`domainProductId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DomainOrder` ADD CONSTRAINT `DomainOrder_domainProductId_fkey` FOREIGN KEY (`domainProductId`) REFERENCES `DomainProduct`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DomainOrder` ADD CONSTRAINT `DomainOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

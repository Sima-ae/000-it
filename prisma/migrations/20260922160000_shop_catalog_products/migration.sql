-- CreateTable
CREATE TABLE `ShopCatalogProduct` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'service',
    `nameNl` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `shortDescriptionNl` TEXT NOT NULL,
    `shortDescriptionEn` TEXT NOT NULL,
    `descriptionNl` LONGTEXT NOT NULL,
    `descriptionEn` LONGTEXT NOT NULL,
    `priceInclCents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `billingInterval` VARCHAR(191) NOT NULL DEFAULT 'one_time',
    `billAsYearlyPackage` BOOLEAN NOT NULL DEFAULT false,
    `checkoutMonths` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `image` TEXT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `planKey` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ShopCatalogProduct_sku_key`(`sku`),
    UNIQUE INDEX `ShopCatalogProduct_slug_key`(`slug`),
    INDEX `ShopCatalogProduct_published_sortOrder_idx`(`published`, `sortOrder`),
    INDEX `ShopCatalogProduct_type_category_idx`(`type`, `category`),
    INDEX `ShopCatalogProduct_billingInterval_idx`(`billingInterval`),
    INDEX `ShopCatalogProduct_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopCatalogProduct` ADD CONSTRAINT `ShopCatalogProduct_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

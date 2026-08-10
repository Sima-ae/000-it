-- CreateTable
CREATE TABLE `ShopOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'nl',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `subtotalExcl` DOUBLE NOT NULL,
    `vatAmount` DOUBLE NOT NULL,
    `totalIncl` DOUBLE NOT NULL,
    `vatRate` DOUBLE NOT NULL DEFAULT 0.21,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `stripeSessionId` VARCHAR(191) NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ShopOrder_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `ShopOrder_stripeSessionId_key`(`stripeSessionId`),
    INDEX `ShopOrder_email_idx`(`email`),
    INDEX `ShopOrder_status_idx`(`status`),
    INDEX `ShopOrder_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPriceIncl` DOUBLE NOT NULL,
    `vatRate` DOUBLE NOT NULL DEFAULT 0.21,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShopOrderItem_orderId_idx`(`orderId`),
    INDEX `ShopOrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopOrder` ADD CONSTRAINT `ShopOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopOrderItem` ADD CONSTRAINT `ShopOrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `ShopOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

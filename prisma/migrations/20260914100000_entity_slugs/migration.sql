-- CreateTable
CREATE TABLE IF NOT EXISTS `EntitySlug` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityKey` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EntitySlug_entityType_entityKey_locale_key`(`entityType`, `entityKey`, `locale`),
    UNIQUE INDEX `EntitySlug_entityType_locale_slug_key`(`entityType`, `locale`, `slug`),
    INDEX `EntitySlug_entityType_locale_idx`(`entityType`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

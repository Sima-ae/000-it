-- CreateTable
CREATE TABLE IF NOT EXISTS `LocalizedCopy` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `itemKey` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `sourceHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LocalizedCopy_kind_itemKey_locale_key`(`kind`, `itemKey`, `locale`),
    INDEX `LocalizedCopy_kind_locale_idx`(`kind`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

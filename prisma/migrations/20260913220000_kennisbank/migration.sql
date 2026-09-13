-- CreateTable
CREATE TABLE `KennisbankCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sortKey` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KennisbankCategory_slug_key`(`slug`),
    INDEX `KennisbankCategory_published_sortKey_idx`(`published`, `sortKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KennisbankCategoryTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    INDEX `KennisbankCategoryTranslation_locale_idx`(`locale`),
    UNIQUE INDEX `KennisbankCategoryTranslation_categoryId_locale_key`(`categoryId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KennisbankArticle` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KennisbankArticle_slug_key`(`slug`),
    INDEX `KennisbankArticle_published_idx`(`published`),
    INDEX `KennisbankArticle_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KennisbankArticleTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `bodyHtml` LONGTEXT NOT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,

    INDEX `KennisbankArticleTranslation_locale_title_idx`(`locale`, `title`),
    UNIQUE INDEX `KennisbankArticleTranslation_articleId_locale_key`(`articleId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KennisbankArticleCategory` (
    `articleId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `KennisbankArticleCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`articleId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KennisbankCategoryTranslation` ADD CONSTRAINT `KennisbankCategoryTranslation_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `KennisbankCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KennisbankArticle` ADD CONSTRAINT `KennisbankArticle_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KennisbankArticleTranslation` ADD CONSTRAINT `KennisbankArticleTranslation_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `KennisbankArticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KennisbankArticleCategory` ADD CONSTRAINT `KennisbankArticleCategory_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `KennisbankArticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KennisbankArticleCategory` ADD CONSTRAINT `KennisbankArticleCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `KennisbankCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

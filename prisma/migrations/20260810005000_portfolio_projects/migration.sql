-- CreateTable
CREATE TABLE `PortfolioProject` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `description` LONGTEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `gallery` JSON NULL,
    `projectUrl` VARCHAR(191) NULL,
    `repoUrl` VARCHAR(191) NULL,
    `clientName` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `tags` JSON NULL,
    `technologies` JSON NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PortfolioProject_slug_key`(`slug`),
    INDEX `PortfolioProject_published_sortOrder_idx`(`published`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

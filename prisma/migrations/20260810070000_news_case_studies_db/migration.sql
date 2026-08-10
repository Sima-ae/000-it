-- CreateTable
CREATE TABLE `NewsPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `description` LONGTEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `projectUrl` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NewsPost_published_date_idx`(`published`, `date`),
    INDEX `NewsPost_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaseStudy` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `industry` VARCHAR(191) NOT NULL,
    `metric` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `description` LONGTEXT NOT NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `projectUrl` VARCHAR(191) NULL,
    `coverImage` VARCHAR(191) NULL,
    `gallery` JSON NULL,
    `year` INT NULL,
    `tags` JSON NULL,
    `technologies` JSON NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CaseStudy_published_year_idx`(`published`, `year`),
    INDEX `CaseStudy_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NewsPost` ADD CONSTRAINT `NewsPost_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaseStudy` ADD CONSTRAINT `CaseStudy_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

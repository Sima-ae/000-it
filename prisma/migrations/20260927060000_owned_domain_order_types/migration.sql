-- AlterTable DomainOrder
ALTER TABLE `DomainOrder` ADD COLUMN `orderType` ENUM('REGISTRATION', 'RENEWAL', 'TRANSFER') NOT NULL DEFAULT 'REGISTRATION';
ALTER TABLE `DomainOrder` ADD COLUMN `authCode` TEXT NULL;

-- CreateIndex
CREATE INDEX `DomainOrder_orderType_createdAt_idx` ON `DomainOrder`(`orderType`, `createdAt`);

-- CreateTable
CREATE TABLE `OwnedDomain` (
    `id` VARCHAR(191) NOT NULL,
    `domainName` VARCHAR(191) NOT NULL,
    `tld` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PENDING_TRANSFER', 'EXPIRED', 'LOCKED_OUT') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NULL,
    `autoRenewEnabled` BOOLEAN NOT NULL DEFAULT false,
    `registrarLocked` BOOLEAN NOT NULL DEFAULT true,
    `whoisGuardEnabled` BOOLEAN NOT NULL DEFAULT false,
    `namecheapId` VARCHAR(191) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OwnedDomain_domainName_key`(`domainName`),
    INDEX `OwnedDomain_userId_status_idx`(`userId`, `status`),
    INDEX `OwnedDomain_tld_idx`(`tld`),
    INDEX `OwnedDomain_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OwnedDomain` ADD CONSTRAINT `OwnedDomain_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Client
ALTER TABLE `Client` ADD COLUMN `website` VARCHAR(191) NULL,
    ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `vatNumber` VARCHAR(191) NULL,
    ADD COLUMN `isLead` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `leadSource` VARCHAR(191) NULL,
    ADD COLUMN `leadStatus` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST') NULL DEFAULT 'NEW';

CREATE INDEX `Client_isLead_leadStatus_idx` ON `Client`(`isLead`, `leadStatus`);
CREATE INDEX `Client_email_idx` ON `Client`(`email`);

-- AlterTable ContactLead
ALTER TABLE `ContactLead` ADD COLUMN `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    ADD COLUMN `source` VARCHAR(191) NULL DEFAULT 'CONTACT_FORM',
    ADD COLUMN `assignedToId` VARCHAR(191) NULL,
    ADD COLUMN `convertedClientId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE INDEX `ContactLead_status_idx` ON `ContactLead`(`status`);
CREATE INDEX `ContactLead_assignedToId_idx` ON `ContactLead`(`assignedToId`);

ALTER TABLE `ContactLead` ADD CONSTRAINT `ContactLead_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable SupportTicket
ALTER TABLE `SupportTicket` ADD COLUMN `ticketType` VARCHAR(191) NULL DEFAULT 'General',
    ADD COLUMN `clientId` VARCHAR(191) NULL,
    ADD COLUMN `projectId` VARCHAR(191) NULL;

CREATE INDEX `SupportTicket_clientId_idx` ON `SupportTicket`(`clientId`);
CREATE INDEX `SupportTicket_projectId_idx` ON `SupportTicket`(`projectId`);

ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable CrmContact
CREATE TABLE `CrmContact` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `CrmContact_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CrmContact` ADD CONSTRAINT `CrmContact_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable CrmNote
CREATE TABLE `CrmNote` (
    `id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `projectId` VARCHAR(191) NULL,
    `ticketId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `CrmNote_clientId_idx`(`clientId`),
    INDEX `CrmNote_projectId_idx`(`projectId`),
    INDEX `CrmNote_ticketId_idx`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CrmNote` ADD CONSTRAINT `CrmNote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CrmNote` ADD CONSTRAINT `CrmNote_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CrmNote` ADD CONSTRAINT `CrmNote_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CrmNote` ADD CONSTRAINT `CrmNote_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Invoice
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `dueDate` DATETIME(3) NULL,
    `items` JSON NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Invoice_number_key`(`number`),
    INDEX `Invoice_clientId_status_idx`(`clientId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable CrmMessage
CREATE TABLE `CrmMessage` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `fromUserId` VARCHAR(191) NOT NULL,
    `toUserId` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `CrmMessage_toUserId_readAt_idx`(`toUserId`, `readAt`),
    INDEX `CrmMessage_fromUserId_idx`(`fromUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CrmMessage` ADD CONSTRAINT `CrmMessage_fromUserId_fkey` FOREIGN KEY (`fromUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CrmMessage` ADD CONSTRAINT `CrmMessage_toUserId_fkey` FOREIGN KEY (`toUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

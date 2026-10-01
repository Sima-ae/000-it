CREATE TABLE `OpsWorkspace` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsWorkspace_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsBoard` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `website` ENUM('TRIPLEZERO', 'EXTRAHOSTING') NULL,
    `templateKey` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsBoard_workspaceId_idx`(`workspaceId`),
    INDEX `OpsBoard_createdById_idx`(`createdById`),
    INDEX `OpsBoard_templateKey_idx`(`templateKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsBoardMember` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'EDITOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OpsBoardMember_userId_idx`(`userId`),
    UNIQUE INDEX `OpsBoardMember_boardId_userId_key`(`boardId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsGroup` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `collapsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsGroup_boardId_sortOrder_idx`(`boardId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsColumn` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('STATUS', 'PEOPLE', 'DATE', 'TIMELINE', 'NUMBER', 'TEXT', 'LONG_TEXT', 'DROPDOWN', 'CHECKBOX', 'TAGS', 'LINK', 'EMAIL', 'PHONE', 'FILE', 'RATING', 'WEBSITE', 'ACTIVITY_TYPE') NOT NULL,
    `settings` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `width` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsColumn_boardId_sortOrder_idx`(`boardId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsItem` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `contactLeadId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsItem_boardId_groupId_sortOrder_idx`(`boardId`, `groupId`, `sortOrder`),
    INDEX `OpsItem_createdById_idx`(`createdById`),
    INDEX `OpsItem_clientId_idx`(`clientId`),
    INDEX `OpsItem_contactLeadId_idx`(`contactLeadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsSubitem` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `assigneeIds` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsSubitem_itemId_sortOrder_idx`(`itemId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsCell` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `columnId` VARCHAR(191) NOT NULL,
    `value` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsCell_columnId_idx`(`columnId`),
    UNIQUE INDEX `OpsCell_itemId_columnId_key`(`itemId`, `columnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsItemUpdate` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OpsItemUpdate_itemId_createdAt_idx`(`itemId`, `createdAt`),
    INDEX `OpsItemUpdate_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsBoardView` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('TABLE', 'KANBAN', 'CALENDAR', 'TIMELINE') NOT NULL DEFAULT 'TABLE',
    `config` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsBoardView_boardId_sortOrder_idx`(`boardId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsDashboard` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsDashboard_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsWidget` (
    `id` VARCHAR(191) NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('COUNT', 'CHART', 'BATTERY', 'LIST') NOT NULL DEFAULT 'COUNT',
    `config` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsWidget_dashboardId_sortOrder_idx`(`dashboardId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsAutomation` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `trigger` JSON NOT NULL,
    `actions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpsAutomation_boardId_enabled_idx`(`boardId`, `enabled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsNotification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `href` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `payload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OpsNotification_userId_readAt_createdAt_idx`(`userId`, `readAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clockInAt` DATETIME(3) NOT NULL,
    `clockOutAt` DATETIME(3) NULL,
    `breakMinutes` INTEGER NOT NULL DEFAULT 75,
    `note` TEXT NULL,
    `date` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkSession_userId_date_idx`(`userId`, `date`),
    INDEX `WorkSession_userId_clockOutAt_idx`(`userId`, `clockOutAt`),
    INDEX `WorkSession_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `website` ENUM('TRIPLEZERO', 'EXTRAHOSTING') NOT NULL,
    `activityType` ENUM('GUEST_POST_PITCH', 'DIRECTORY_SUBMISSION', 'SOCIAL_POST', 'SOCIAL_ENGAGEMENT', 'OUTREACH_EMAIL', 'FOLLOW_UP', 'CONTENT_WRITING', 'DESIGN', 'DEV_FIX', 'COMMUNITY', 'PROSPECT_RESEARCH', 'TEMPLATE', 'PLANNING', 'OTHER') NOT NULL,
    `contact` VARCHAR(191) NULL,
    `status` ENUM('SENT', 'FOLLOW_UP', 'WON', 'LOST', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'IN_PROGRESS',
    `notes` TEXT NULL,
    `nextFollowUp` DATETIME(3) NULL,
    `minutesSpent` INTEGER NULL,
    `itemId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `contactLeadId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkLog_userId_date_idx`(`userId`, `date`),
    INDEX `WorkLog_website_activityType_idx`(`website`, `activityType`),
    INDEX `WorkLog_status_nextFollowUp_idx`(`status`, `nextFollowUp`),
    INDEX `WorkLog_itemId_idx`(`itemId`),
    INDEX `WorkLog_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyBrief` (
    `id` VARCHAR(191) NOT NULL,
    `weekStart` VARCHAR(191) NOT NULL,
    `body` JSON NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WeeklyBrief_createdById_idx`(`createdById`),
    UNIQUE INDEX `WeeklyBrief_weekStart_key`(`weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpsChecklistItem` (
    `id` VARCHAR(191) NOT NULL,
    `period` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'ONBOARDING') NOT NULL,
    `dayKey` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `defaultMinutes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

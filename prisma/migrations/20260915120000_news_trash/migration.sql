-- News trash / retention fields (idempotent for DBs that already received them via db push).

SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'NewsPost' AND COLUMN_NAME = 'deletedAt'
    ),
    'SELECT 1',
    'ALTER TABLE `NewsPost` ADD COLUMN `deletedAt` DATETIME(3) NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'NewsPost' AND COLUMN_NAME = 'deletedReason'
    ),
    'SELECT 1',
    'ALTER TABLE `NewsPost` ADD COLUMN `deletedReason` VARCHAR(191) NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'NewsPost' AND COLUMN_NAME = 'retentionExempt'
    ),
    'SELECT 1',
    'ALTER TABLE `NewsPost` ADD COLUMN `retentionExempt` BOOLEAN NOT NULL DEFAULT false'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'NewsPost' AND INDEX_NAME = 'NewsPost_deletedAt_idx'
    ),
    'SELECT 1',
    'CREATE INDEX `NewsPost_deletedAt_idx` ON `NewsPost`(`deletedAt`)'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

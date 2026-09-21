-- Nested kennisbank categories (e.g. SSL under Beveiliging)
ALTER TABLE `KennisbankCategory` ADD COLUMN `parentId` VARCHAR(191) NULL;

CREATE INDEX `KennisbankCategory_parentId_idx` ON `KennisbankCategory`(`parentId`);

ALTER TABLE `KennisbankCategory`
  ADD CONSTRAINT `KennisbankCategory_parentId_fkey`
  FOREIGN KEY (`parentId`) REFERENCES `KennisbankCategory`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Rename WordPress support packages: Basic → Pro, Standard → Double
-- Keep Premium unchanged. Update slug, sku, names and descriptions.

UPDATE `ShopCatalogProduct`
SET
  `slug` = 'pro-support',
  `sku` = 'SVC-PRO-SUPPORT',
  `nameNl` = REPLACE(REPLACE(`nameNl`, 'Basic Support', 'Pro Support'), 'Basic support', 'Pro support'),
  `nameEn` = REPLACE(`nameEn`, 'Basic Support', 'Pro Support'),
  `shortDescriptionNl` = REPLACE(`shortDescriptionNl`, 'Basic Support', 'Pro Support'),
  `shortDescriptionEn` = REPLACE(`shortDescriptionEn`, 'Basic Support', 'Pro Support'),
  `descriptionNl` = REPLACE(`descriptionNl`, 'Basic Support', 'Pro Support'),
  `descriptionEn` = REPLACE(`descriptionEn`, 'Basic Support', 'Pro Support'),
  `image` = REPLACE(`image`, 'basic-support.png', 'pro-support.png'),
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'basic-support';

UPDATE `ShopCatalogProduct`
SET
  `slug` = 'pro-support-yearly',
  `sku` = 'SVC-PRO-SUPPORT-YEARLY',
  `nameNl` = REPLACE(REPLACE(`nameNl`, 'Basic Support', 'Pro Support'), 'Basic support', 'Pro support'),
  `nameEn` = REPLACE(`nameEn`, 'Basic Support', 'Pro Support'),
  `shortDescriptionNl` = REPLACE(`shortDescriptionNl`, 'Basic Support', 'Pro Support'),
  `shortDescriptionEn` = REPLACE(`shortDescriptionEn`, 'Basic Support', 'Pro Support'),
  `descriptionNl` = REPLACE(`descriptionNl`, 'Basic Support', 'Pro Support'),
  `descriptionEn` = REPLACE(`descriptionEn`, 'Basic Support', 'Pro Support'),
  `image` = REPLACE(`image`, 'basic-support.png', 'pro-support.png'),
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'basic-support-yearly';

UPDATE `ShopCatalogProduct`
SET
  `slug` = 'double-support',
  `sku` = 'SVC-DOUBLE-SUPPORT',
  `nameNl` = REPLACE(REPLACE(`nameNl`, 'Standard Support', 'Double Support'), 'Standard support', 'Double support'),
  `nameEn` = REPLACE(`nameEn`, 'Standard Support', 'Double Support'),
  `shortDescriptionNl` = REPLACE(`shortDescriptionNl`, 'Standard Support', 'Double Support'),
  `shortDescriptionEn` = REPLACE(`shortDescriptionEn`, 'Standard Support', 'Double Support'),
  `descriptionNl` = REPLACE(`descriptionNl`, 'Standard Support', 'Double Support'),
  `descriptionEn` = REPLACE(`descriptionEn`, 'Standard Support', 'Double Support'),
  `image` = REPLACE(`image`, 'standard-support.png', 'double-support.png'),
  `featured` = true,
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'standard-support';

UPDATE `ShopCatalogProduct`
SET
  `slug` = 'double-support-yearly',
  `sku` = 'SVC-DOUBLE-SUPPORT-YEARLY',
  `nameNl` = REPLACE(REPLACE(`nameNl`, 'Standard Support', 'Double Support'), 'Standard support', 'Double support'),
  `nameEn` = REPLACE(`nameEn`, 'Standard Support', 'Double Support'),
  `shortDescriptionNl` = REPLACE(`shortDescriptionNl`, 'Standard Support', 'Double Support'),
  `shortDescriptionEn` = REPLACE(`shortDescriptionEn`, 'Standard Support', 'Double Support'),
  `descriptionNl` = REPLACE(`descriptionNl`, 'Standard Support', 'Double Support'),
  `descriptionEn` = REPLACE(`descriptionEn`, 'Standard Support', 'Double Support'),
  `image` = REPLACE(`image`, 'standard-support.png', 'double-support.png'),
  `featured` = true,
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'standard-support-yearly';

-- Migration script: rename the old stock table to stocks
-- Run this only if the database still has a table named `stock` and no conflicting `stocks` table exists.

USE erp_supermarche;

RENAME TABLE stock TO stocks;

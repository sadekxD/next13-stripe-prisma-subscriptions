/*
  Warnings:

  - You are about to alter the column `unit_amount` on the `prices` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "prices" ALTER COLUMN "unit_amount" SET DATA TYPE INTEGER;

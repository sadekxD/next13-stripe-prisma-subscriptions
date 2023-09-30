/*
  Warnings:

  - You are about to drop the column `payment_method` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "payment_method",
ADD COLUMN     "paymentMethod" JSONB;

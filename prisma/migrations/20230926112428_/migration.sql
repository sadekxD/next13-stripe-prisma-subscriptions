/*
  Warnings:

  - You are about to drop the column `email` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `customers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_user_id_fkey";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "email",
DROP COLUMN "user_id";

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "customers"("id");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

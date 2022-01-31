/*
  Warnings:

  - You are about to drop the column `is_l1` on the `chain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chain" DROP COLUMN "is_l1",
ADD COLUMN     "is_layer1" BOOLEAN NOT NULL DEFAULT false;

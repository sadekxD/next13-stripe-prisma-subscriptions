-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "expired_at" DROP NOT NULL,
ALTER COLUMN "cancel_at" DROP NOT NULL,
ALTER COLUMN "cancelled_at" DROP NOT NULL,
ALTER COLUMN "trial_start" DROP NOT NULL,
ALTER COLUMN "trial_end" DROP NOT NULL;

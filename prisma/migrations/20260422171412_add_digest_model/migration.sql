-- CreateEnum
CREATE TYPE "DigestStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ManagerDigest" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" "DigestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "ManagerDigest_pkey" PRIMARY KEY ("id")
);

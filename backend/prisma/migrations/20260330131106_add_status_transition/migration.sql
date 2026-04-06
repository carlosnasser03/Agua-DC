-- CreateTable
CREATE TABLE "StatusTransition" (
    "id" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusTransition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StatusTransition_fromStatus_toStatus_key" ON "StatusTransition"("fromStatus", "toStatus");

-- CreateIndex
CREATE INDEX "StatusTransition_fromStatus_idx" ON "StatusTransition"("fromStatus");

-- Seed initial valid transitions
INSERT INTO "StatusTransition" ("id", "fromStatus", "toStatus") VALUES
  (gen_random_uuid(), 'ENVIADO', 'EN_REVISION'),
  (gen_random_uuid(), 'ENVIADO', 'RECHAZADO'),
  (gen_random_uuid(), 'EN_REVISION', 'VALIDADO'),
  (gen_random_uuid(), 'EN_REVISION', 'RECHAZADO'),
  (gen_random_uuid(), 'VALIDADO', 'RESUELTO'),
  (gen_random_uuid(), 'VALIDADO', 'RECHAZADO'),
  (gen_random_uuid(), 'RECHAZADO', 'EN_REVISION');

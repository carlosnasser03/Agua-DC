-- CreateTable ExcelValidationRule
CREATE TABLE "ExcelValidationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "ruleConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcelValidationRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for unique name
CREATE UNIQUE INDEX "ExcelValidationRule_name_key" ON "ExcelValidationRule"("name");

-- CreateIndex for enabled filter
CREATE INDEX "ExcelValidationRule_enabled_idx" ON "ExcelValidationRule"("enabled");

-- Seed initial validation rules
INSERT INTO "ExcelValidationRule" ("id", "name", "description", "enabled", "errorMessage", "ruleType", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'require_colony_match', 'Require that all colony names match a known colony in the master list', true, 'La colonia "{colonyName}" en la fila {rowNumber} no coincide con ninguna colonia conocida', 'COLONY_MATCH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'require_valid_date', 'Require that the period dates in row 3 are valid', true, 'Las fechas del período no son válidas o no se pudieron detectar en la Fila 3', 'VALID_DATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'require_valid_time', 'Require that time entries are in valid format (HH:MM-HH:MM)', true, 'El horario "{timeStr}" en la fila {rowNumber} no es válido (debe ser HH:MM-HH:MM)', 'VALID_TIME', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

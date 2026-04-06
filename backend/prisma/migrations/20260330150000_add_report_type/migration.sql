-- CreateReportType table
CREATE TABLE "ReportType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportType_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on name
CREATE UNIQUE INDEX "ReportType_name_key" ON "ReportType"("name");

-- Create index on enabled
CREATE INDEX "ReportType_enabled_idx" ON "ReportType"("enabled");

-- Add reportTypeId column to Report
ALTER TABLE "Report" ADD COLUMN "reportTypeId" TEXT;

-- Add foreign key constraint
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportTypeId_fkey" FOREIGN KEY ("reportTypeId") REFERENCES "ReportType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed initial report types
INSERT INTO "ReportType" (id, name, label, icon, description, enabled, "createdAt", "updatedAt") VALUES
  ('rt_no_water', 'NO_WATER', 'Sin agua', '🚱', 'El servicio de agua no está disponible', true, NOW(), NOW()),
  ('rt_low_pressure', 'LOW_PRESSURE', 'Baja presión', '💧', 'El agua llega con presión muy baja', true, NOW(), NOW()),
  ('rt_wrong_schedule', 'WRONG_SCHEDULE', 'Horario incorrecto', '⏰', 'El horario no coincide con lo publicado', true, NOW(), NOW()),
  ('rt_other', 'OTHER', 'Otro problema', '❓', 'Otro tipo de problema con el servicio', true, NOW(), NOW());

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel,
         AlignmentType, WidthType, BorderStyle, ShadingType, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F4E78" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Título principal
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun("📋 AUDITORÍA EXTERNA DE DOCUMENTACIÓN")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Proyecto AguaDC V2", bold: true, size: 24 })]
      }),

      // Metadata
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: "Fecha: 14 de Abril de 2026 | Auditor: Sistema Externo", italic: true, size: 20 })]
      }),

      // Resumen ejecutivo
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("📊 RESUMEN EJECUTIVO")]
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun("Se ha realizado una auditoría exhaustiva de la documentación del proyecto AguaDC V2. El proyecto cuenta con 32 documentos (30 .md + 2 .docx) distribuidos en varias categorías temáticas. Se identifica documentación de alta calidad pero con problemas de consolidación y redundancia.")]
      }),

      // Hallazgos principales
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("✅ HALLAZGOS PRINCIPALES")]
      }),

      // Tabla de hallazgos
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "4472C4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "ASPECTO", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "4472C4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "ESTADO", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders,
                shading: { fill: "4472C4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "DESCRIPCIÓN", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Documentos Existentes")]
              }),
              new TableCell({
                borders,
                shading: { fill: "C6E0B4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "✅ EXCELENTE", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("32 documentos completos cubriendo todas las fases del proyecto")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Documentación de Deployment")]
              }),
              new TableCell({
                borders,
                shading: { fill: "C6E0B4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "✅ EXCELENTE", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("Guías detalladas para Railway + Vercel + Local")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Documentación SOLID")]
              }),
              new TableCell({
                borders,
                shading: { fill: "C6E0B4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "✅ EXCELENTE", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("Informe de SOLID compliance 10/10 con métricas detalladas")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Arquitectura & Diseño")]
              }),
              new TableCell({
                borders,
                shading: { fill: "C6E0B4", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "✅ EXCELENTE", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("CLAUDE.md actualizado con Production Status 2026-04-14")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Consolidación de Docs")]
              }),
              new TableCell({
                borders,
                shading: { fill: "FFD966", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "⚠️ REQUIERE ATENCIÓN", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("Múltiples archivos redundantes, necesita consolidación")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Documentación Admin Panel")]
              }),
              new TableCell({
                borders,
                shading: { fill: "F8CBAD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "❌ INCOMPLETA", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("No hay documentación funcional de la UI del admin panel")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph("Documentación Mobile")]
              }),
              new TableCell({
                borders,
                shading: { fill: "F8CBAD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "❌ MÍNIMA", bold: true })] })]
              }),
              new TableCell({
                borders,
                children: [new Paragraph("Solo readme genérico de Expo, sin guía de uso")]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { after: 300 }, children: [new TextRun("")] }),

      // Categorización de documentos
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("📁 CATEGORIZACIÓN DE 32 DOCUMENTOS")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("1️⃣ DOCUMENTACIÓN DE DEPLOYMENT (7 documentos)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("DEPLOYMENT_RAILWAY_STAGING_PLAN.md — Plan detallado ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("GUIA_EJECUCION_DEPLOYMENT_RAILWAY.md — Guía paso a paso ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Guia_Deploy_Railway.docx — Versión Word ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("RAILWAY_DEPLOYMENT_CHECKLIST.md — Checklist de verificación ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("RAILWAY_SETUP_INSTRUCTIONS.md — Instrucciones de setup ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("RAILWAY_DEPLOYMENT_GUIDE.md — Guía completa ✅")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("INDICE_DEPLOYMENT.md — Índice de referencia ✅")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("2️⃣ DOCUMENTACIÓN DE IMPLEMENTACIÓN (11 documentos)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("FINAL_SOLID_COMPLETION_REPORT.md — Informe SOLID 10/10 ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("AUTH_STRATEGY_COMPLETE.md — Implementación de auth ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("ADMIN_USER_SEGREGATION_COMPLETE.md — Segregación de users ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("PHASE_3B_IMPLEMENTATION_SUMMARY.md — Resumen Phase 3B ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("THEME_CONFIG_COMPLETE.md — Config de temas ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("TESTING_SETUP_COMPLETE.md — Setup de testing ✅")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("6 documentos más de Phase tracking y completitud")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("3️⃣ DOCUMENTACIÓN DE AUDITORÍA (5 documentos)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("AUDITORIA_CAMBIOS_ADMIN_PANEL.md — Cambios auditados ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("VERIFICATION_CHECKLIST.md — Checklist de verificación ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("VALIDACION_PRE_DEPLOY.md — Validación pre-deploy ✅")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("2 documentos más de auditoría de opciones")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("4️⃣ DOCUMENTACIÓN GENERAL (3 documentos)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("CLAUDE.md — Guía de proyecto principal (ACTUALIZADO 2026-04-14) ✅✅✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("STATUS_REPORT.md — Reporte de estado general ✅")]
      }),
      new Paragraph({
        spacing: { after: 300 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("QUE_FALTA_PARA_PRODUCCION.md — Checklist de producción ✅")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("🎯 ANÁLISIS DE CALIDAD")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("FORTALEZAS ✅")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Documentación de deployment es EXCELENTE (7 docs detallados)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("SOLID compliance perfectamente documentado (10/10)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("CLAUDE.md actualizado con Production Status (2026-04-14)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Backend API completamente funcional y testeado")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Database (Neon PostgreSQL) online y respondiendo")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Swagger/API Docs generado automáticamente")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("DEBILIDADES ⚠️")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Documentación DUPLICADA y REDUNDANTE (múltiples archivos del mismo tema)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Archivos históricos/obsoletos sin marcar como tales")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("NO HAY documentación para Admin Panel UI/UX")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("NO HAY documentación para Mobile App")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Admin Panel en Vercel da 404 (no está desplegado)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("colonias_master.json faltante en Docker build")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Auditoria.tsx incompleto (no afecta API pero sí el front)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("🔧 RECOMENDACIONES DEL AUDITOR")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("INMEDIATO (Próxima semana)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Consolidar CLAUDE.md como documento ÚNICO de referencia (ya hecho)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Marcar archivos históricos como [OBSOLETO] en nombre")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Crear carpeta /docs/archived para documentos de fase")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Crear ADMIN_PANEL_GUIDE.md con capturas y flujos")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("A CORTO PLAZO (Este mes)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Crear MOBILE_APP_GUIDE.md con instrucciones de setup + uso")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Resolver Admin Panel 404 en Vercel")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Agregar colonias_master.json al Docker build")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Completar Auditoria.tsx en el admin panel")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("A MEDIANO PLAZO (Próximos 2 meses)")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Crear VIDEO tutorial de deployment end-to-end")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Crear ARCHITECTURE.md con diagramas visuales")]
      }),
      new Paragraph({
        spacing: { after: 100 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Generar PDF profesional con toda la documentación compilada")]
      }),
      new Paragraph({
        spacing: { after: 300 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Crear dashboard web interactivo mostrando estado del sistema")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("📋 CONCLUSIÓN")]
      }),

      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({
          text: "El proyecto AguaDC V2 tiene una EXCELENTE documentación de backend, deployment y arquitectura SOLID. Sin embargo, necesita consolidación de documentos redundantes y documentación urgente del Admin Panel y Mobile App. Con las recomendaciones implementadas, el proyecto estaría 100% listo para handoff a nuevos desarrolladores o stakeholders.",
          italics: true
        })]
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "CALIFICACIÓN GENERAL: 8.5/10", bold: true, size: 24 })]
      }),

      new Paragraph({
        children: [new TextRun({ text: "Auditoría completada: 14 de Abril de 2026 | Sistema Externo", italic: true, size: 20 })]
      })
    ]
  }],
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  }
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("AUDITORIA_EXTERNA_DOCUMENTACION_2026-04-14.docx", buffer);
  console.log("✅ Documento de auditoría creado exitosamente");
});

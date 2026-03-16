import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // --- PERMISOS ---
  const permissionsData = [
    { module: 'SCHEDULES', action: 'VALIDATE', description: 'Validar archivos Excel' },
    { module: 'SCHEDULES', action: 'PUBLISH',  description: 'Publicar horarios oficiales' },
    { module: 'REPORTS',   action: 'UPDATE_STATUS', description: 'Cambiar estado de reportes' },
    { module: 'USERS',     action: 'MANAGE',   description: 'Gestionar usuarios y roles' },
    { module: 'AUDIT',     action: 'VIEW',     description: 'Ver bitacora de auditoria' },
  ];

  const dbPermissions: any[] = [];
  for (const p of permissionsData) {
    const dbP = await prisma.permission.upsert({
      where: { module_action: { module: p.module, action: p.action } },
      update: { description: p.description },
      create: { module: p.module, action: p.action, description: p.description },
    });
    dbPermissions.push(dbP);
  }
  console.log(`${dbPermissions.length} permisos creados/actualizados.`);

  // --- ROLES ---
  const superAdmin = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: { name: 'Super Admin', description: 'Acceso total al sistema' },
  });

  const adminOperativo = await prisma.role.upsert({
    where: { name: 'Admin Operativo' },
    update: {},
    create: { name: 'Admin Operativo', description: 'Gestion operativa de horarios y reportes' },
  });

  const editorDatos = await prisma.role.upsert({
    where: { name: 'Editor de Datos' },
    update: {},
    create: { name: 'Editor de Datos', description: 'Subir y validar archivos Excel' },
  });

  const agenteReportes = await prisma.role.upsert({
    where: { name: 'Agente de Reportes' },
    update: {},
    create: { name: 'Agente de Reportes', description: 'Gestionar reportes ciudadanos' },
  });

  // Super Admin: todos los permisos
  for (const p of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdmin.id, permissionId: p.id } },
      update: {},
      create: { roleId: superAdmin.id, permissionId: p.id },
    });
  }

  // Admin Operativo: horarios (validar + publicar) y reportes
  const adminOp_perms = dbPermissions.filter(p =>
    ['SCHEDULES:VALIDATE', 'SCHEDULES:PUBLISH', 'REPORTS:UPDATE_STATUS']
      .includes(`${p.module}:${p.action}`)
  );
  for (const p of adminOp_perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminOperativo.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminOperativo.id, permissionId: p.id },
    });
  }

  // Editor de Datos: solo validar horarios
  const editor_perms = dbPermissions.filter(p => p.module === 'SCHEDULES' && p.action === 'VALIDATE');
  for (const p of editor_perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: editorDatos.id, permissionId: p.id } },
      update: {},
      create: { roleId: editorDatos.id, permissionId: p.id },
    });
  }

  // Agente de Reportes: actualizar estado de reportes
  const agente_perms = dbPermissions.filter(p => p.module === 'REPORTS');
  for (const p of agente_perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: agenteReportes.id, permissionId: p.id } },
      update: {},
      create: { roleId: agenteReportes.id, permissionId: p.id },
    });
  }

  console.log('Roles y permisos configurados.');

  // --- USUARIO ADMINISTRADOR INICIAL ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@aguadc.hn';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AguaDC_Admin_2026!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullname: 'Administrador del Sistema',
      password: hashedPassword,
      roleId: superAdmin.id,
      status: 'ACTIVE',
    },
  });

  console.log('-------------------------------------------');
  console.log('Usuario administrador listo:');
  console.log(`  Email:      ${adminEmail}`);
  console.log(`  Contrasena: ${adminPassword}`);
  console.log('  IMPORTANTE: cambia la contrasena en produccion!');
  console.log('-------------------------------------------');
  console.log('Seed completado con exito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

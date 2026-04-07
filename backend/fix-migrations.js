const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lee todas las migraciones
const migrationsDir = path.join(__dirname, 'prisma', 'migrations');
const migrations = fs.readdirSync(migrationsDir).filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory());

console.log(`Encontradas ${migrations.length} migraciones...`);

// Resuelve todas como "rolled-back" (las reaplicará)
for (const migration of migrations) {
  try {
    console.log(`Resolviendo ${migration}...`);
    execSync(`npx prisma migrate resolve --rolled-back ${migration}`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`⚠️ ${migration} ya estaba resuelta`);
  }
}

// Ahora aplica todas las migraciones
console.log('\nAplicando todas las migraciones...');
execSync('npx prisma migrate deploy', { stdio: 'inherit' });

console.log('✅ ¡Listo!');

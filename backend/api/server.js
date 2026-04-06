// api/server.js — Vercel serverless entry point (CommonJS)
// Este archivo usa module.exports para que @vercel/node lo reconozca correctamente.

let cachedHandler = null;

async function getHandler() {
  if (cachedHandler) return cachedHandler;
  // dist/main.js exporta el handler como exports.default (TypeScript CJS)
  const mod = require('../dist/main');
  cachedHandler = mod.default || mod;
  return cachedHandler;
}

module.exports = async (req, res) => {
  const handler = await getHandler();
  return handler(req, res);
};

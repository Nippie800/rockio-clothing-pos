// db/index.ts
export async function initDbSafe() {
  // On native, we can safely import sqlite
  const mod = await import('./database');
  await mod.initDb();
}

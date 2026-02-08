// db/index.web.ts
export async function initDbSafe() {
  // Web fallback: do nothing (POS DB is mobile-only)
  console.log('ℹ️ Web build: SQLite disabled.');
}

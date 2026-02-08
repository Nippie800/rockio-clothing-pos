// src/db/database.ts  (or db/database.ts)
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    // Newer expo-sqlite API
    db = SQLite.openDatabaseSync('clothingstorepos.db');
  }
  return db;
}

export async function initDb() {
  const database = getDb();

  // Enable foreign keys (recommended)
  await database.execAsync('PRAGMA foreign_keys = ON;');

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'Clothing' | 'Tattoo' | 'Accessory'
      size TEXT,
      colour TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_time TEXT NOT NULL,
      product_id INTEGER,
      description TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'Cash' | 'Card'
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      date_time TEXT NOT NULL,
      tattoo_description TEXT NOT NULL,
      estimated_price REAL,
      deposit_paid REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Booked', -- 'Booked' | 'Completed' | 'Cancelled'
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

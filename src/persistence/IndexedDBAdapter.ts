import { openDB, type IDBPDatabase } from 'idb';
import type { SaveData } from '../types/game';

const DB_NAME = 'astrizda-saves';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'version' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveToDB(data: SaveData): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, data);
}

export async function loadFromDB(id: string): Promise<SaveData | null> {
  const db = await getDB();
  const result = await db.get(STORE_NAME, Number(id));
  return result ?? null;
}

export async function getAllSaves(): Promise<SaveData[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'timestamp');
  return all.sort((a: SaveData, b: SaveData) => b.timestamp - a.timestamp);
}

export async function deleteSaveFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, Number(id));
}

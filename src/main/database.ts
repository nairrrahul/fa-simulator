import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function initDatabase(): void {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'BaseData.db');
  
  // Copy template if doesn't exist
  const templateDbPath = app.isPackaged
    ? path.join(process.resourcesPath, 'database', 'BaseData.db')
    : path.join(__dirname, '../../resources/database/BaseData.db');
  
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.copyFileSync(templateDbPath, dbPath);
  }
  
  db = new Database(dbPath);
}

export function loadGameData() {
  if (!db) throw new Error('Database not initialized');
  
  const nations = db.prepare('SELECT * FROM NATIONS').all();
  
  return {
    nations
  };
}

export function saveGameData(data: { nations: any[] }) {
  if (!db) throw new Error('Database not initialized');
  
  const updateNation = db.prepare(`
    UPDATE NATIONS 
    SET rankingPts = ?, gameState = ?, youthRating = ?
    WHERE id = ?
  `);
  
  const transaction = db.transaction((nations) => {
    for (const nation of nations) {
      updateNation.run(
        nation.rankingPts,
        nation.gameState,
        nation.youthRating,
        nation.id
      );
    }
  });
  
  transaction(data.nations);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
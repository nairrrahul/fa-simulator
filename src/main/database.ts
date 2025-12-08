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
  const fixtures = db.prepare('SELECT * FROM FIXTURES').all();
  const knockoutMappings = db.prepare('SELECT * FROM KNOCKOUTMAPPING').all();
  
  return {
    nations,
    fixtures,
    knockoutMappings
  };
}

export function saveGameData(data: { 
  nations: any[], 
  fixtures: any[],
  knockoutMappings: any[]
}) {
  if (!db) throw new Error('Database not initialized');
  
  const updateNation = db.prepare(`
    UPDATE NATIONS 
    SET rankingPts = ?, gameState = ?, youthRating = ?
    WHERE id = ?
  `);
  
  const updateFixture = db.prepare(`
    UPDATE FIXTURES
    SET team1ID = ?, team2ID = ?, result = ?, date = ?
    WHERE ID = ?
  `);
  
  const transaction = db.transaction((nations, fixtures) => {
    for (const nation of nations) {
      updateNation.run(
        nation.rankingPts,
        nation.gameState,
        nation.youthRating,
        nation.id
      );
    }
    
    for (const fixture of fixtures) {
      updateFixture.run(
        fixture.team1ID,
        fixture.team2ID,
        fixture.result,
        fixture.date,
        fixture.id
      );
    }
  });
  
  transaction(data.nations, data.fixtures);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
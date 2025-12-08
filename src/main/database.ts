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
  const competitions = db.prepare('SELECT * FROM COMPETITIONS').all();
  const gameStatusRaw = db.prepare('SELECT * FROM GAMESTATUS').get() as any;
  
  return {
    nations,
    fixtures,
    knockoutMappings,
    competitions,
    gameStatusRaw
  };
}

export function saveGameData(data: { 
  nations: any[], 
  fixtures: any[],
  knockoutMappings: any[],
  gameStatus: { year: number, month: number, day: number }
}) {
  if (!db) throw new Error('Database not initialized');
  
  const updateNation = db.prepare(`
    UPDATE NATIONS 
    SET rankingPts = ?, gameState = ?, youthRating = ?
    WHERE id = ?
  `);
  
  const updateFixture = db.prepare(`
    UPDATE FIXTURES
    SET team1ID = ?, team2ID = ?, scoreline = ?, outcome = ?, date = ?
    WHERE ID = ?
  `);
  
  const updateGameStatus = db.prepare(`
    UPDATE GAMESTATUS
    SET year = ?, month = ?, day = ?
  `);
  
   const transaction = db.transaction((nations, fixtures, gameStatus) => {
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
        fixture.scoreline,
        fixture.outcome,
        fixture.date,
        fixture.id
      );
    }
    
    updateGameStatus.run(
      gameStatus.year,
      gameStatus.month,
      gameStatus.day
    );
  });
  
  transaction(data.nations, data.fixtures, data.gameStatus);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
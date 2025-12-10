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
  const fixturesRaw = db.prepare('SELECT * FROM FIXTURES').all();
  const knockoutMappingsRaw = db.prepare('SELECT * FROM KNOCKOUTMAPPING').all();
  const competitions = db.prepare('SELECT * FROM COMPETITIONS').all();
  const gameStatusRaw = db.prepare('SELECT * FROM GAMESTATUS').get() as any;
  const competitionGroups = db.prepare('SELECT * FROM COMPETITIONGROUPS').all();
  const competitionHosts = db.prepare('SELECT * FROM COMPETITIONHOSTS').all();
  const competitionSnapshots = db.prepare('SELECT * FROM COMPETITIONSNAPSHOT').all();
  const competitionQualified = db.prepare('SELECT * FROM COMPETITIONQUALIFIED').all();
  
  // Map database column names to interface property names for fixtures
  const fixtures = fixturesRaw.map((f: any) => ({
    id: f.ID,
    team1ID: f.team1ID,
    team2ID: f.team2ID,
    competitionID: f.competitionId,
    groupID: f.groupId,
    roundID: f.roundId,
    date: f.calculateddate,
    scoreline: f.scoreline,
    outcome: f.outcome
  }));
  
  const knockoutMappings = knockoutMappingsRaw.map((m: any) => ({
    matchID: m.matchID,
    team1MatchID: m.team1ID,
    team2MatchID: m.team2ID,
    isLoser: m.isLoser
  }));
  
  // Map game status
  const gameStatus = {
    year: gameStatusRaw.year,
    month: gameStatusRaw.month,
    day: gameStatusRaw.day
  };
  
  return {
    nations,
    fixtures,
    knockoutMappings,
    competitions,
    gameStatus,
    competitionGroups,
    competitionHosts,
    competitionSnapshots,
    competitionQualified
  };
}

export function saveGameData(data: { 
  nations: any[], 
  fixtures: any[],
  knockoutMappings: any[],
  gameStatus: { year: number, month: number, day: number },
  competitionGroups: any[]
}) {
  if (!db) throw new Error('Database not initialized');
  
  const updateNation = db.prepare(`
    UPDATE NATIONS 
    SET rankingPts = ?, gameState = ?, youthRating = ?
    WHERE id = ?
  `);
  
  const updateFixture = db.prepare(`
    UPDATE FIXTURES
    SET team1ID = ?, team2ID = ?, scoreline = ?, outcome = ?, calculateddate = ?
    WHERE ID = ?
  `);
  
  const updateGameStatus = db.prepare(`
    UPDATE GAMESTATUS
    SET year = ?, month = ?, day = ?
  `);
  
  const updateCompetitionGroup = db.prepare(`
    UPDATE COMPETITIONGROUPS
    SET gamesPlayed = ?, wins = ?, draws = ?, losses = ?, 
        goalsFor = ?, goalsAgainst = ?
    WHERE competitionID = ? AND year = ? AND groupID = ? AND teamID = ?
  `);
  
  const transaction = db.transaction((nations, fixtures, gameStatus, competitionGroups) => {
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
    
    for (const group of competitionGroups) {
      updateCompetitionGroup.run(
        group.gamesPlayed,
        group.wins,
        group.draws,
        group.losses,
        group.goalsFor,
        group.goalsAgainst,
        group.competitionID,
        group.year,
        group.groupID,
        group.teamID
      );
    }
  });
  
  transaction(data.nations, data.fixtures, data.gameStatus, data.competitionGroups);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
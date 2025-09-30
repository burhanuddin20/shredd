import * as SQLite from 'expo-sqlite';

// Types for our database tables
export interface Fast {
  id?: number;
  planId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  xpEarned: number;
  synced: boolean;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
  synced: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  totalXP: number;
  streak: number;
  currentPlan: string;
  createdAt: string;
  synced: boolean;
}

// Database connection
let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('shredd.db');
    
    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        planId TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        xpEarned INTEGER NOT NULL DEFAULT 0,
        synced BOOLEAN NOT NULL DEFAULT 0
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        unlockedAt TEXT NOT NULL,
        synced BOOLEAN NOT NULL DEFAULT 0
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT,
        totalXP INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0,
        currentPlan TEXT NOT NULL DEFAULT '16:8',
        createdAt TEXT NOT NULL,
        synced BOOLEAN NOT NULL DEFAULT 0
      );
    `);
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Helper function to ensure database is initialized
const ensureDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Fast-related functions
export const addFast = async (fast: Omit<Fast, 'id' | 'synced'>): Promise<number> => {
  const database = ensureDb();
  
  const result = await database.runAsync(
    `INSERT INTO fasts (planId, startTime, endTime, status, xpEarned, synced) 
     VALUES (?, ?, ?, ?, ?, 0)`,
    [fast.planId, fast.startTime, fast.endTime || null, fast.status, fast.xpEarned]
  );
  
  return result.lastInsertRowId;
};

export const getFasts = async (): Promise<Fast[]> => {
  const database = ensureDb();
  
  const result = await database.getAllAsync(
    'SELECT * FROM fasts ORDER BY startTime DESC'
  );
  
  return result.map((row: any) => ({
    id: row.id as number,
    planId: row.planId as string,
    startTime: row.startTime as string,
    endTime: row.endTime as string | undefined,
    status: row.status as Fast['status'],
    xpEarned: row.xpEarned as number,
    synced: Boolean(row.synced),
  }));
};

export const getActiveFast = async (): Promise<Fast | null> => {
  const database = ensureDb();
  
  const result = await database.getFirstAsync(
    "SELECT * FROM fasts WHERE status = 'active' ORDER BY startTime DESC LIMIT 1"
  );
  
  if (!result) return null;
  
  return {
    id: (result as any).id as number,
    planId: (result as any).planId as string,
    startTime: (result as any).startTime as string,
    endTime: (result as any).endTime as string | undefined,
    status: (result as any).status as Fast['status'],
    xpEarned: (result as any).xpEarned as number,
    synced: Boolean((result as any).synced),
  };
};

export const updateFastStatus = async (id: number, status: Fast['status'], endTime?: string): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'UPDATE fasts SET status = ?, endTime = ?, synced = 0 WHERE id = ?',
    [status, endTime || null, id]
  );
};

export const updateFastXP = async (id: number, xpEarned: number): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'UPDATE fasts SET xpEarned = ?, synced = 0 WHERE id = ?',
    [xpEarned, id]
  );
};

export const updateFastTimes = async (id: number, startTime: string, endTime?: string): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'UPDATE fasts SET startTime = ?, endTime = ?, synced = 0 WHERE id = ?',
    [startTime, endTime || null, id]
  );
};

export const deleteFast = async (id: number): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'DELETE FROM fasts WHERE id = ?',
    [id]
  );
};

// Achievement-related functions
export const unlockAchievement = async (id: string): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'INSERT OR REPLACE INTO achievements (id, unlockedAt, synced) VALUES (?, ?, 0)',
    [id, new Date().toISOString()]
  );
};

export const getAchievements = async (): Promise<Achievement[]> => {
  const database = ensureDb();
  
  const result = await database.getAllAsync(
    'SELECT * FROM achievements ORDER BY unlockedAt DESC'
  );
  
  return result.map((row: any) => ({
    id: row.id as string,
    unlockedAt: row.unlockedAt as string,
    synced: Boolean(row.synced),
  }));
};

export const hasAchievement = async (id: string): Promise<boolean> => {
  const database = ensureDb();
  
  const result = await database.getFirstAsync(
    'SELECT id FROM achievements WHERE id = ?',
    [id]
  );
  
  return Boolean(result);
};

// User-related functions
export const saveUser = async (user: UserProfile): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    `INSERT OR REPLACE INTO user (id, username, email, totalXP, streak, currentPlan, createdAt, synced) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [user.id, user.username, user.email || null, user.totalXP, user.streak, user.currentPlan, user.createdAt]
  );
};

export const getUser = async (): Promise<UserProfile | null> => {
  const database = ensureDb();
  
  const result = await database.getFirstAsync('SELECT * FROM user LIMIT 1');
  
  if (!result) return null;
  
  return {
    id: (result as any).id as string,
    username: (result as any).username as string,
    email: (result as any).email as string | undefined,
    totalXP: (result as any).totalXP as number,
    streak: (result as any).streak as number,
    currentPlan: (result as any).currentPlan as string,
    createdAt: (result as any).createdAt as string,
    synced: Boolean((result as any).synced),
  };
};

export const updateUserXP = async (totalXP: number): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'UPDATE user SET totalXP = ?, synced = 0',
    [totalXP]
  );
};

export const updateUserStreak = async (streak: number): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    'UPDATE user SET streak = ?, synced = 0',
    [streak]
  );
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
  const database = ensureDb();

  const fields = [];
  const values = [];

  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.totalXP !== undefined) {
    fields.push('totalXP = ?');
    values.push(updates.totalXP);
  }
  if (updates.streak !== undefined) {
    fields.push('streak = ?');
    values.push(updates.streak);
  }
  if (updates.currentPlan !== undefined) {
    fields.push('currentPlan = ?');
    values.push(updates.currentPlan);
  }

  if (fields.length > 0) {
    fields.push('synced = 0');
    await database.runAsync(
      `UPDATE user SET ${fields.join(', ')}`,
      values
    );
  }
};

// Clear all data from the database (useful for testing)
export const clearAllData = async (): Promise<void> => {
  const database = ensureDb();
  
  try {
    await database.runAsync('DELETE FROM achievements');
    await database.runAsync('DELETE FROM fasts');
    await database.runAsync('DELETE FROM user');
    console.log('All data cleared from database');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
};

// Utility functions for sync
export const getUnsyncedFasts = async (): Promise<Fast[]> => {
  const database = ensureDb();
  
  const result = await database.getAllAsync(
    'SELECT * FROM fasts WHERE synced = 0 ORDER BY startTime DESC'
  );
  
  return result.map((row: any) => ({
    id: row.id as number,
    planId: row.planId as string,
    startTime: row.startTime as string,
    endTime: row.endTime as string | undefined,
    status: row.status as Fast['status'],
    xpEarned: row.xpEarned as number,
    synced: Boolean(row.synced),
  }));
};

export const getUnsyncedAchievements = async (): Promise<Achievement[]> => {
  const database = ensureDb();
  
  const result = await database.getAllAsync(
    'SELECT * FROM achievements WHERE synced = 0 ORDER BY unlockedAt DESC'
  );
  
  return result.map((row: any) => ({
    id: row.id as string,
    unlockedAt: row.unlockedAt as string,
    synced: Boolean(row.synced),
  }));
};

export const markAsSynced = async (table: 'fasts' | 'achievements' | 'user', id: string | number): Promise<void> => {
  const database = ensureDb();
  
  await database.runAsync(
    `UPDATE ${table} SET synced = 1 WHERE ${typeof id === 'string' ? 'id' : 'id'} = ?`,
    [id]
  );
};


// Get database stats
export const getDatabaseStats = async () => {
  const database = ensureDb();
  
  const fastCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM fasts');
  const achievementCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM achievements');
  const userCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM user');
  
  return {
    fasts: (fastCount as any)?.count as number || 0,
    achievements: (achievementCount as any)?.count as number || 0,
    users: (userCount as any)?.count as number || 0,
  };
};

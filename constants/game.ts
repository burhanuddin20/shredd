export const RANKS = [
  'Cadet',
  'Trainee', 
  'Soldier',
  'Corporal',
  'Sergeant',
  'Lieutenant',
  'Captain',
  'Major',
  'Colonel',
  'Commander',
  'General',
  'Commander-in-Chief',
  'Titan Slayer',
  'Humanity\'s Hope',
  'Legendary Warrior'
];

// XP requirements for each level (level 0 = 0 XP, level 1 = 100 XP, etc.)
export const XP_PER_LEVEL = [
  0, 100, 250, 500, 750, 1000, 1500, 2000, 3000, 4000,
  5000, 6500, 8000, 10000, 12500, 15000, 18000, 21000, 25000, 30000
];

// Fasting plans with duration in hours
export const FASTING_PLANS = [
  // { id: 'test-5s', name: '5s Test', fastingHours: 5/3600, eatingHours: 10/3600, difficulty: 'Test' }, // 5 seconds for testing
  { id: '12:12', name: '12:12 Easy', fastingHours: 12, eatingHours: 12, difficulty: 'Easy' },
  { id: '16:8', name: '16:8 Advanced', fastingHours: 16, eatingHours: 8, difficulty: 'Advanced' },
  { id: '18:6', name: '18:6 Advanced', fastingHours: 18, eatingHours: 6, difficulty: 'Advanced' },
  { id: '20:4', name: '20:4 Expert', fastingHours: 20, eatingHours: 4, difficulty: 'Expert' },
  { id: '23:1', name: '23:1 Titan', fastingHours: 23, eatingHours: 1, difficulty: 'Titan' },
];

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 'first_fast', name: 'First Fast', description: 'Complete your first fast', xpReward: 50 },
  { id: 'fast_12h', name: '12 Hour Warrior', description: 'Fast for 12 hours', xpReward: 100 },
  { id: 'fast_16h', name: '16 Hour Veteran', description: 'Fast for 16 hours', xpReward: 150 },
  { id: 'fast_18h', name: '18 Hour Elite', description: 'Fast for 18 hours', xpReward: 200 },
  { id: 'fast_20h', name: '20 Hour Master', description: 'Fast for 20 hours', xpReward: 250 },
  { id: 'fast_24h', name: '24 Hour Titan', description: 'Fast for 24 hours', xpReward: 300 },
  { id: 'streak_7d', name: '7 Day Streak', description: 'Fast for 7 consecutive days', xpReward: 500 },
  { id: 'streak_14d', name: '14 Day Streak', description: 'Fast for 14 consecutive days', xpReward: 750 },
  { id: 'streak_30d', name: '30 Day Streak', description: 'Fast for 30 consecutive days', xpReward: 1000 },
  { id: 'streak_60d', name: '60 Day Streak', description: 'Fast for 60 consecutive days', xpReward: 1500 },
  { id: 'streak_90d', name: '90 Day Streak', description: 'Fast for 90 consecutive days', xpReward: 2000 },
  { id: 'streak_180d', name: '180 Day Streak', description: 'Fast for 180 consecutive days', xpReward: 3000 },
  { id: 'streak_365d', name: '365 Day Streak', description: 'Fast for 365 consecutive days', xpReward: 5000 },
  { id: 'total_5', name: '5 Fast Veteran', description: 'Complete 5 fasts', xpReward: 200 },
  { id: 'total_10', name: '10 Fast Veteran', description: 'Complete 10 fasts', xpReward: 200 },
  { id: 'total_20', name: '20 Fast Elite', description: 'Complete 20 fasts', xpReward: 400 },
  { id: 'total_50', name: '50 Fast Master', description: 'Complete 50 fasts', xpReward: 750 },
  { id: 'total_100', name: '100 Fast Legend', description: 'Complete 100 fasts', xpReward: 1500 },
  { id: 'total_200', name: '200 Fast Titan', description: 'Complete 200 fasts', xpReward: 3000 },
  // todo add one for starting fast
];

// XP rewards for completing fasts
export const getXPReward = (fastingHours: number): number => {
  if (fastingHours >= 24) return 100;
  if (fastingHours >= 20) return 80;
  if (fastingHours >= 18) return 60;
  if (fastingHours >= 16) return 40;
  if (fastingHours >= 12) return 20;
  return 150;
};

// Calculate user level from total XP
export const calculateLevel = (totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } => {
  let level = 0;
  let currentLevelXP = totalXP;
  let nextLevelXP = XP_PER_LEVEL[1];
  
  for (let i = 0; i < XP_PER_LEVEL.length - 1; i++) {
    if (totalXP >= XP_PER_LEVEL[i] && totalXP < XP_PER_LEVEL[i + 1]) {
      level = i;
      currentLevelXP = totalXP - XP_PER_LEVEL[i];
      nextLevelXP = XP_PER_LEVEL[i + 1] - XP_PER_LEVEL[i];
      break;
    }
  }
  
  // If XP exceeds max level
  if (totalXP >= XP_PER_LEVEL[XP_PER_LEVEL.length - 1]) {
    level = XP_PER_LEVEL.length - 1;
    currentLevelXP = totalXP - XP_PER_LEVEL[level];
    nextLevelXP = 0; // Max level reached
  }
  
  return { level, currentLevelXP, nextLevelXP };
};

// Get rank name from level
export const getRankName = (level: number): string => {
  return RANKS[Math.min(level, RANKS.length - 1)];
};

// Fast status types
export type FastStatus = 'not-started' | 'in-progress' | 'paused' | 'completed' | 'cancelled';

// Fast type definition
export interface Fast {
  id: string;
  planId: string;
  startTime: Date;
  endTime?: Date;
  actualEndTime?: Date;
  status: FastStatus;
  xpEarned?: number;
  achievements?: string[];
}

// User profile type
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalFasts: number;
  achievements: string[];
  currentPlan?: string;
  createdAt: Date;
}

import { useDatabase } from '@/src/lib/DatabaseProvider';
import {
  Achievement,
  getAchievements,
  getUser,
  hasAchievement,
  unlockAchievement,
  updateUserProfile as updateUserProfileDb,
  updateUserStreak,
  updateUserXP,
  UserProfile,
} from '@/src/lib/db';
import { useEffect, useState } from 'react';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized: dbInitialized } = useDatabase();

  // Load initial data only after database is initialized
  useEffect(() => {
    if (dbInitialized) {
      loadUserData();
    }
  }, [dbInitialized]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [profile, userAchievements] = await Promise.all([
        getUser(),
        getAchievements()
      ]);
      
      setUserProfile(profile);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addXP = async (xpToAdd: number): Promise<void> => {
    if (!userProfile) return;

    try {
      const newTotalXP = userProfile.totalXP + xpToAdd;
      await updateUserXP(newTotalXP);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, totalXP: newTotalXP } : null);
    } catch (error) {
      console.error('Failed to add XP:', error);
      throw error;
    }
  };

  const updateStreak = async (newStreak: number): Promise<void> => {
    if (!userProfile) return;

    try {
      await updateUserStreak(newStreak);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, streak: newStreak } : null);
    } catch (error) {
      console.error('Failed to update streak:', error);
      throw error;
    }
  };

  const unlockUserAchievement = async (achievementId: string): Promise<void> => {
    try {
      // Check if already unlocked
      const alreadyUnlocked = await hasAchievement(achievementId);
      if (alreadyUnlocked) {
        console.log('Achievement already unlocked:', achievementId);
        return;
      }

      await unlockAchievement(achievementId);
      
      // Reload achievements
      const updatedAchievements = await getAchievements();
      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  };

  const checkAndUnlockAchievements = async (totalFasts: number, longestFastHours: number, currentStreak: number): Promise<void> => {
    const achievementChecks = [
      { id: 'first_fast', condition: totalFasts >= 1 },
      { id: 'fast_12_hours', condition: longestFastHours >= 12 },
      { id: 'fast_16_hours', condition: longestFastHours >= 16 },
      { id: 'fast_18_hours', condition: longestFastHours >= 18 },
      { id: 'fast_20_hours', condition: longestFastHours >= 20 },
      { id: 'fast_24_hours', condition: longestFastHours >= 24 },
      { id: 'streak_7_days', condition: currentStreak >= 7 },
      { id: 'streak_14_days', condition: currentStreak >= 14 },
      { id: 'streak_30_days', condition: currentStreak >= 30 },
      { id: 'total_10_fasts', condition: totalFasts >= 10 },
      { id: 'total_20_fasts', condition: totalFasts >= 20 },
      { id: 'total_50_fasts', condition: totalFasts >= 50 },
      { id: 'total_100_fasts', condition: totalFasts >= 100 },
    ];

    for (const check of achievementChecks) {
      if (check.condition) {
        await unlockUserAchievement(check.id);
      }
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      await updateUserProfileDb(updates);
      await loadUserData();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return {
    userProfile,
    achievements,
    isLoading,
    addXP,
    updateStreak,
    updateUserProfile,
    unlockAchievement: unlockUserAchievement,
    checkAndUnlockAchievements,
    refreshData: loadUserData,
  };
};

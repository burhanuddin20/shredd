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
      
      console.log('useUserProfile - Loaded user data - XP:', profile?.totalXP || 0);
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
      console.log('useUserProfile - Adding XP:', xpToAdd, 'New total:', newTotalXP);
      await updateUserXP(newTotalXP);
      
      // Reload user data to ensure all components get updated
      console.log('useUserProfile - Reloading user data after XP update');
      await loadUserData();
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
      { id: 'fast_12h', condition: longestFastHours >= 12 },
      { id: 'fast_16h', condition: longestFastHours >= 16 },
      { id: 'fast_18h', condition: longestFastHours >= 18 },
      { id: 'fast_20h', condition: longestFastHours >= 20 },
      { id: 'fast_24h', condition: longestFastHours >= 24 },
      { id: 'streak_7d', condition: currentStreak >= 7 },
      { id: 'streak_14d', condition: currentStreak >= 14 },
      { id: 'streak_30d', condition: currentStreak >= 30 },
      { id: 'total_5', condition: totalFasts >= 5 },
      { id: 'total_10', condition: totalFasts >= 10 },
      { id: 'total_20', condition: totalFasts >= 20 },
      { id: 'total_50', condition: totalFasts >= 50 },
      { id: 'total_100', condition: totalFasts >= 100 },
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

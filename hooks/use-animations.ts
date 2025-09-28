import { getRankName } from '@/constants/game';
import { useCallback, useState } from 'react';

export interface LevelUpData {
  newLevel: number;
  newRank: string;
  xpEarned: number;
}

export interface AchievementData {
  achievement: any;
  isUnlocked: boolean;
}

export const useAnimations = () => {
  // Level Up Animation State
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  // Achievement Animation State
  const [achievementVisible, setAchievementVisible] = useState(false);
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);

  // Trigger Level Up Animation
  const triggerLevelUp = useCallback((newLevel: number, xpEarned: number) => {
    const newRank = getRankName(newLevel);
    setLevelUpData({
      newLevel,
      newRank,
      xpEarned,
    });
    setLevelUpVisible(true);
  }, []);

  // Trigger Achievement Unlock Animation
  const triggerAchievementUnlock = useCallback((achievement: any, isUnlocked: boolean = true) => {
    setAchievementData({
      achievement,
      isUnlocked,
    });
    setAchievementVisible(true);
  }, []);

  // Close Level Up Animation
  const closeLevelUp = useCallback(() => {
    setLevelUpVisible(false);
    setLevelUpData(null);
  }, []);

  // Close Achievement Animation
  const closeAchievement = useCallback(() => {
    setAchievementVisible(false);
    setAchievementData(null);
  }, []);

  return {
    // Level Up
    levelUpVisible,
    levelUpData,
    triggerLevelUp,
    closeLevelUp,
    
    // Achievement
    achievementVisible,
    achievementData,
    triggerAchievementUnlock,
    closeAchievement,
  };
};

import { ACHIEVEMENTS } from '@/constants/game';
import { getUserSettings } from '@/src/lib/settings';
import { schedulePushNotification } from '@/src/services/notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDatabase } from './DatabaseProvider';
import { Achievement, getAchievements, getUser, hasAchievement, unlockAchievement as unlockAchievementDb, updateUserProfile as updateUserProfileDb, updateUserStreak, updateUserXP, UserProfile } from './db';

interface UserProfileContextType {
    userProfile: UserProfile | null;
    achievements: Achievement[];
    isLoading: boolean;
    addXP: (xpToAdd: number) => Promise<void>;
    updateStreak: (newStreak: number) => Promise<void>;
    unlockAchievement: (achievementId: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    checkAndUnlockAchievements: (totalFasts: number, fastingHours: number, streak: number, isCompletedFast?: boolean) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};

interface UserProfileProviderProps {
    children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
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

            // Update local state immediately for better UX
            setUserProfile(prev => prev ? { ...prev, totalXP: newTotalXP } : null);

            // Also reload from database to ensure consistency
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

            // Schedule streak reminder notification if enabled
            const settings = await getUserSettings();
            if (settings.notifications && settings.streakReminders && newStreak > 0) {
                // Schedule a reminder for the next day to keep the streak alive
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(20, 0, 0, 0); // E.g., remind at 8 PM tomorrow

                // For simplicity, we'll schedule one reminder. A more robust solution
                // would check if a reminder is already scheduled for tomorrow.
                await schedulePushNotification(
                    'Streak Reminder',
                    `Your fasting streak is at ${newStreak} days! Don't forget to log your fast tomorrow to keep it going.`,
                    { type: 'streak_reminder', streak: newStreak, date: tomorrow.toISOString() },
                    tomorrow // Schedule for tomorrow
                );
                console.log('[STREAK] Streak reminder scheduled for:', tomorrow.toISOString());
            } else if (settings.notifications && settings.streakReminders && newStreak === 0) {
                // If streak is reset to 0, cancel any pending streak reminders
                // Note: This simplified approach cancels ALL, in a real app, you'd cancel specific ones.
                await cancelAllScheduledNotifications();
                console.log('[STREAK] All scheduled notifications cancelled due to streak reset.');
            }

            // Update local state immediately
            setUserProfile(prev => prev ? { ...prev, streak: newStreak } : null);

            // Reload from database
            await loadUserData();
        } catch (error) {
            console.error('Failed to update streak:', error);
            throw error;
        }
    };

    const unlockAchievement = async (achievementId: string): Promise<void> => {
        try {
            await unlockAchievementDb(achievementId);

            // Fetch achievement details from constants/game.ts
            const achievementDetails = ACHIEVEMENTS.find(a => a.id === achievementId);
            const settings = await getUserSettings();

            if (settings.notifications && settings.achievementNotifications && achievementDetails) {
                await schedulePushNotification(
                    'Achievement Unlocked!',
                    `You earned the ${achievementDetails.name} achievement! ${achievementDetails.description}`,
                    { type: 'achievement', achievementId }
                );
                console.log('[ACHIEVEMENTS] Achievement notification scheduled for:', achievementId);
            }

            await loadUserData();
        } catch (error) {
            console.error('Failed to unlock achievement:', error);
            throw error;
        }
    };

    const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        try {
            await updateUserProfileDb(updates);
            await loadUserData();
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
    };

    const checkAndUnlockAchievements = async (totalFasts: number, fastingHours: number, streak: number, isCompletedFast: boolean = true): Promise<void> => {

        // Check first fast achievement
        if (totalFasts === 1) {
            const hasFirstFast = await hasAchievement('first_fast');
            if (!hasFirstFast) {
                await unlockAchievementDb('first_fast');
                await loadUserData(); // Reload to update achievements
            }
        }

        // Check fasting duration achievements - only for completed fasts
        if (isCompletedFast) {
            const durationAchievements = [
                { hours: 12, id: 'fast_12h' },
                { hours: 16, id: 'fast_16h' },
                { hours: 18, id: 'fast_18h' },
                { hours: 20, id: 'fast_20h' },
                { hours: 24, id: 'fast_24h' },
            ];

            for (const achievement of durationAchievements) {
                if (fastingHours >= achievement.hours) {
                    const hasAchievementUnlocked = await hasAchievement(achievement.id);
                    if (!hasAchievementUnlocked) {
                        await unlockAchievementDb(achievement.id);
                        await loadUserData();
                    }
                }
            }
        }

        // Check streak achievements
        const streakAchievements = [
            { days: 7, id: 'streak_7d' },
            { days: 14, id: 'streak_14d' },
            { days: 30, id: 'streak_30d' },
            { days: 60, id: 'streak_60d' },
            { days: 90, id: 'streak_90d' },
            { days: 180, id: 'streak_180d' },
            { days: 365, id: 'streak_365d' },
        ];

        for (const achievement of streakAchievements) {
            if (streak >= achievement.days) {
                const hasAchievementUnlocked = await hasAchievement(achievement.id);
                if (!hasAchievementUnlocked) {
                    await unlockAchievementDb(achievement.id);
                    await loadUserData();
                }
            }
        }

        // Check total fasts achievements
        const totalFastsAchievements = [
            { count: 5, id: 'total_5' },
            { count: 10, id: 'total_10' },
            { count: 20, id: 'total_20' },
            { count: 50, id: 'total_50' },
            { count: 100, id: 'total_100' },
            { count: 200, id: 'total_200' },
        ];

        for (const achievement of totalFastsAchievements) {
            if (totalFasts >= achievement.count) {
                const hasAchievementUnlocked = await hasAchievement(achievement.id);
                if (!hasAchievementUnlocked) {
                    await unlockAchievementDb(achievement.id);
                    await loadUserData();
                }
            }
        }
    };

    const refreshUserData = async (): Promise<void> => {
        await loadUserData();
    };

    const value: UserProfileContextType = {
        userProfile,
        achievements,
        isLoading,
        addXP,
        updateStreak,
        unlockAchievement,
        updateUserProfile,
        checkAndUnlockAchievements,
        refreshUserData,
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
};

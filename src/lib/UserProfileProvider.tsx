import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDatabase } from './DatabaseProvider';
import { Achievement, getAchievements, getUser, updateUserStreak, updateUserXP, UserProfile } from './db';

interface UserProfileContextType {
    userProfile: UserProfile | null;
    achievements: Achievement[];
    isLoading: boolean;
    addXP: (xpToAdd: number) => Promise<void>;
    updateStreak: (newStreak: number) => Promise<void>;
    unlockAchievement: (achievementId: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    checkAndUnlockAchievements: (totalFasts: number, fastingHours: number, streak: number) => Promise<void>;
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

            console.log('UserProfileProvider - Loaded user data - XP:', profile?.totalXP || 0);
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
            console.log('UserProfileProvider - Adding XP:', xpToAdd, 'New total:', newTotalXP);
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
            await unlockAchievement(achievementId);
            await loadUserData();
        } catch (error) {
            console.error('Failed to unlock achievement:', error);
            throw error;
        }
    };

    const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        try {
            await updateUserProfile(updates);
            await loadUserData();
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
    };

    const checkAndUnlockAchievements = async (totalFasts: number, fastingHours: number, streak: number): Promise<void> => {
        // This would contain the achievement logic
        // For now, just a placeholder
        console.log('Checking achievements for:', { totalFasts, fastingHours, streak });
    };

    const refreshUserData = async (): Promise<void> => {
        console.log('UserProfileProvider - Manually refreshing user data');
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

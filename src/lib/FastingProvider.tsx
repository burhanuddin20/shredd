import { FASTING_PLANS } from '@/constants/game';
import { getUserSettings } from '@/src/lib/settings'; // Assuming you have a settings service
import { cancelAllScheduledNotifications, schedulePushNotification } from '@/src/services/notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDatabase } from './DatabaseProvider';
import {
    addFast,
    deleteFast as deleteFastFromDb,
    getActiveFast,
    getFasts,
    updateFastStatus,
    updateFastTimes,
    updateFastXP,
    type Fast
} from './db';

interface FastingContextType {
    currentFast: Fast | null;
    fastHistory: Fast[];
    isLoading: boolean;
    startFast: (planId: string) => Promise<number>;
    endFast: (fastId: number, xpEarned: number) => Promise<void>;
    pauseFast: (fastId: number) => Promise<void>;
    resumeFast: (fastId: number) => Promise<void>;
    cancelFast: (fastId: number) => Promise<void>;
    updateFast: (fastId: number, startTime: string, endTime?: string) => Promise<void>;
    deleteFast: (fastId: number) => Promise<void>;
    refreshData: () => Promise<void>;
}

const FastingContext = createContext<FastingContextType | undefined>(undefined);

export const useFasting = () => {
    const context = useContext(FastingContext);
    if (!context) {
        throw new Error('useFasting must be used within a FastingProvider');
    }
    return context;
};

export const FastingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentFast, setCurrentFast] = useState<Fast | null>(null);
    const [fastHistory, setFastHistory] = useState<Fast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isInitialized: dbInitialized } = useDatabase();

    // Track previous values to avoid duplicate logs
    const prevDataRef = React.useRef({ totalFasts: 0, completedFasts: 0 });

    const loadFastData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [activeFast, allFasts] = await Promise.all([
                getActiveFast(),
                getFasts()
            ]);

            // Track data changes
            const completedFasts = allFasts.filter(f => f.status === 'completed').length;
            prevDataRef.current = { totalFasts: allFasts.length, completedFasts };

            setCurrentFast(activeFast);
            setFastHistory(allFasts);
        } catch (error) {
            console.error('Failed to load fast data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load initial data only after database is initialized
    useEffect(() => {
        if (dbInitialized) {
            loadFastData();
        }
    }, [dbInitialized, loadFastData]);

    const startFast = useCallback(async (planId: string): Promise<number> => {
        try {
            const fastId = await addFast({
                planId,
                startTime: new Date().toISOString(),
                status: 'active',
                xpEarned: 0,
            });

            // Get fasting plan details
            const plan = FASTING_PLANS.find(p => p.id === planId);
            if (!plan) {
                console.warn('[FASTING] Fasting plan not found for ID:', planId);
            }

            // Schedule fast reminder notification if enabled
            const settings = await getUserSettings();
            if (settings.notifications && settings.reminderNotifications && plan) {
                const endTime = new Date(Date.now() + plan.fastingHours * 60 * 60 * 1000);
                await schedulePushNotification(
                    'Fast Reminder',
                    `Your ${plan.name} fast is scheduled to end at ${endTime.toLocaleTimeString()}.`,
                    { type: 'fast_end', fastId },
                    endTime // Pass the exact end time for scheduling
                );
                console.log('[FASTING] Fast end reminder scheduled.');
            }

            // Reload data to get the new fast
            await loadFastData();

            return fastId;
        } catch (error) {
            console.error('Failed to start fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const endFast = useCallback(async (fastId: number, xpEarned: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'completed', new Date().toISOString());
            await updateFastXP(fastId, xpEarned);

            // Schedule a 'Fast Completed!' notification if achievement notifications are enabled
            const settings = await getUserSettings();
            if (settings.notifications && settings.achievementNotifications) {
                const fast = fastHistory.find(f => f.id === fastId);
                const plan = FASTING_PLANS.find(p => p.id === fast?.planId);
                if (fast && plan) {
                    await schedulePushNotification(
                        'Fast Completed!',
                        `Congratulations! You successfully completed your ${plan.name} fast.`,
                        { type: 'fast_completed', fastId }
                    );
                    console.log('[FASTING] Fast completed notification scheduled.');

                    // Schedule 'Time to Start Fast!' notification for the end of the eating window
                    if (settings.reminderNotifications) {
                        const eatingEndTime = new Date(new Date().getTime() + plan.eatingHours * 60 * 60 * 1000);
                        await schedulePushNotification(
                            'Time to Start Fast!',
                            `Your eating window for ${plan.name} is over. Time to start your next fast!`,
                            { type: 'eating_end', fastId: fast.id },
                            eatingEndTime
                        );
                        console.log('[FASTING] Eating window end reminder scheduled.');
                    }
                }
            }

            // Cancel any pending fast reminders
            await cancelAllScheduledNotifications(); // This is a simple approach, might need refinement
            console.log('[FASTING] Fast end reminder cancelled.');

            // Reload data
            await loadFastData();
        } catch (error) {
            console.error('Failed to end fast:', error);
            throw error;
        }
    }, [loadFastData, fastHistory]);

    const pauseFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'paused');
            // Cancel reminders on pause for now, could re-schedule with adjustment
            await cancelAllScheduledNotifications();
            console.log('[FASTING] Fast reminders cancelled on pause.');
            await loadFastData();
        } catch (error) {
            console.error('Failed to pause fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const resumeFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'active');
            // Re-schedule reminder on resume if it was cancelled
            const settings = await getUserSettings();
            const fast = fastHistory.find(f => f.id === fastId);
            const plan = FASTING_PLANS.find(p => p.id === fast?.planId);

            if (settings.notifications && settings.reminderNotifications && fast && plan) {
                const endTime = new Date(new Date(fast.startTime).getTime() + plan.fastingHours * 60 * 60 * 1000);
                // Ensure it's a future time
                if (endTime.getTime() > Date.now()) {
                    await schedulePushNotification(
                        'Fast Reminder',
                        `Your ${plan.name} fast is scheduled to end at ${endTime.toLocaleTimeString()}.`,
                        { type: 'fast_end', fastId },
                        endTime // Schedule for the calculated end time
                    );
                    console.log('[FASTING] Fast end reminder re-scheduled.');
                }
            }
            await loadFastData();
        } catch (error) {
            console.error('Failed to resume fast:', error);
            throw error;
        }
    }, [loadFastData, fastHistory]);

    const cancelFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'cancelled', new Date().toISOString());

            // Cancel any pending fast reminders
            await cancelAllScheduledNotifications();
            console.log('[FASTING] Fast end reminder cancelled.');

            await loadFastData();
        } catch (error) {
            console.error('Failed to cancel fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const updateFast = useCallback(async (fastId: number, startTime: string, endTime?: string): Promise<void> => {
        try {
            await updateFastTimes(fastId, startTime, endTime);

            // After update, if the fast is active and reminders are on, re-schedule
            const fast = fastHistory.find(f => f.id === fastId);
            const settings = await getUserSettings();
            const plan = FASTING_PLANS.find(p => p.id === fast?.planId);

            if (settings.notifications && settings.reminderNotifications && fast && plan && fast.status === 'active') {
                const newEndTime = new Date(new Date(startTime).getTime() + plan.fastingHours * 60 * 60 * 1000);
                // Ensure it's a future time
                if (newEndTime.getTime() > Date.now()) {
                    await cancelAllScheduledNotifications(); // Cancel existing first
                    await schedulePushNotification(
                        'Fast Reminder',
                        `Your ${plan.name} fast is now scheduled to end at ${newEndTime.toLocaleTimeString()}.`,
                        { type: 'fast_end', fastId },
                        newEndTime // Schedule for the new calculated end time
                    );
                    console.log('[FASTING] Fast end reminder re-scheduled due to update.');
                }
            }

            await loadFastData();
        } catch (error) {
            console.error('Failed to update fast:', error);
            throw error;
        }
    }, [loadFastData, fastHistory]);

    const deleteFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await deleteFastFromDb(fastId);
            await loadFastData();
        } catch (error) {
            console.error('Failed to delete fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const value: FastingContextType = {
        currentFast,
        fastHistory,
        isLoading,
        startFast,
        endFast,
        pauseFast,
        resumeFast,
        cancelFast,
        updateFast,
        deleteFast,
        refreshData: loadFastData,
    };

    return (
        <FastingContext.Provider value={value}>
            {children}
        </FastingContext.Provider>
    );
};


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

            // Reload data
            await loadFastData();
        } catch (error) {
            console.error('Failed to end fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const pauseFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'paused');
            await loadFastData();
        } catch (error) {
            console.error('Failed to pause fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const resumeFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'active');
            await loadFastData();
        } catch (error) {
            console.error('Failed to resume fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const cancelFast = useCallback(async (fastId: number): Promise<void> => {
        try {
            await updateFastStatus(fastId, 'cancelled', new Date().toISOString());
            await loadFastData();
        } catch (error) {
            console.error('Failed to cancel fast:', error);
            throw error;
        }
    }, [loadFastData]);

    const updateFast = useCallback(async (fastId: number, startTime: string, endTime?: string): Promise<void> => {
        try {
            await updateFastTimes(fastId, startTime, endTime);
            await loadFastData();
        } catch (error) {
            console.error('Failed to update fast:', error);
            throw error;
        }
    }, [loadFastData]);

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


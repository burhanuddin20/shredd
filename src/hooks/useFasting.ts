import { useDatabase } from '@/src/lib/DatabaseProvider';
import {
    addFast,
    deleteFast as deleteFastFromDb,
    getActiveFast,
    getFasts,
    updateFastStatus,
    updateFastTimes,
    updateFastXP,
    type Fast as FastType
} from '@/src/lib/db';
import { useEffect, useState } from 'react';

export const useFasting = () => {
  const [currentFast, setCurrentFast] = useState<FastType | null>(null);
  const [fastHistory, setFastHistory] = useState<FastType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized: dbInitialized } = useDatabase();

  // Load initial data only after database is initialized
  useEffect(() => {
    if (dbInitialized) {
      loadFastData();
    }
  }, [dbInitialized]);

  const loadFastData = async () => {
    try {
      setIsLoading(true);
      const [activeFast, allFasts] = await Promise.all([
        getActiveFast(),
        getFasts()
      ]);
      
      // Only log when data actually changes
      const completedFasts = allFasts.filter(f => f.status === 'completed').length;
      if (allFasts.length !== fastHistory.length || completedFasts !== fastHistory.filter(f => f.status === 'completed').length) {
        console.log('useFasting - Data updated - Total fasts:', allFasts.length, 'Completed:', completedFasts);
      }
      
      setCurrentFast(activeFast);
      setFastHistory(allFasts);
    } catch (error) {
      console.error('Failed to load fast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startFast = async (planId: string): Promise<number> => {
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
  };

  const endFast = async (fastId: number, xpEarned: number): Promise<void> => {
    try {
      console.log('useFasting - Ending fast:', fastId, 'with XP:', xpEarned);
      await updateFastStatus(fastId, 'completed', new Date().toISOString());
      await updateFastXP(fastId, xpEarned);
      
      // Reload data
      console.log('useFasting - Reloading data after ending fast');
      await loadFastData();
    } catch (error) {
      console.error('Failed to end fast:', error);
      throw error;
    }
  };

  const pauseFast = async (fastId: number): Promise<void> => {
    try {
      await updateFastStatus(fastId, 'paused');
      
      // Reload data
      await loadFastData();
    } catch (error) {
      console.error('Failed to pause fast:', error);
      throw error;
    }
  };

  const resumeFast = async (fastId: number): Promise<void> => {
    try {
      await updateFastStatus(fastId, 'active');
      
      // Reload data
      await loadFastData();
    } catch (error) {
      console.error('Failed to resume fast:', error);
      throw error;
    }
  };

  const cancelFast = async (fastId: number): Promise<void> => {
    try {
      await updateFastStatus(fastId, 'cancelled', new Date().toISOString());
      
      // Reload data
      await loadFastData();
    } catch (error) {
      console.error('Failed to cancel fast:', error);
      throw error;
    }
  };

  const updateFast = async (fastId: number, startTime: string, endTime?: string): Promise<void> => {
    try {
      await updateFastTimes(fastId, startTime, endTime);
      
      // Reload data
      await loadFastData();
    } catch (error) {
      console.error('Failed to update fast:', error);
      throw error;
    }
  };

  const deleteFast = async (fastId: number): Promise<void> => {
    try {
      await deleteFastFromDb(fastId);
      
      // Reload data
      await loadFastData();
    } catch (error) {
      console.error('Failed to delete fast:', error);
      throw error;
    }
  };

  return {
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
};

/**
 * Example usage of SQLite database functions
 * This file demonstrates how to use the database utilities in your app
 */

import {
    addFast,
    clearAllData,
    getAchievements,
    getActiveFast,
    getDatabaseStats,
    getFasts,
    getUnsyncedAchievements,
    getUnsyncedFasts,
    getUser,
    hasAchievement,
    initDatabase,
    markAsSynced,
    saveUser,
    unlockAchievement,
    updateFastStatus,
    updateFastXP,
    updateUserStreak,
    updateUserXP,
    type UserProfile
} from '../lib/db';

/**
 * Example: Initialize database and create a user
 */
export const initializeApp = async () => {
  try {
    // Initialize database (this creates tables if they don't exist)
    await initDatabase();
    console.log('Database initialized');

    // Create a user profile
    const user: UserProfile = {
      id: 'user_123',
      username: 'JohnDoe',
      email: 'john@example.com',
      totalXP: 0,
      streak: 0,
      synced: false,
    };

    await saveUser(user);
    console.log('User created:', user.username);
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

/**
 * Example: Start a fast and track it
 */
export const startAndTrackFast = async () => {
  try {
    // Start a new fast
    const fastId = await addFast({
      planId: '16:8',
      startTime: new Date().toISOString(),
      status: 'active',
      xpEarned: 0,
    });
    
    console.log('Fast started with ID:', fastId);

    // Simulate some time passing...
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update XP earned (e.g., after completing the fast)
    await updateFastXP(fastId, 50);
    console.log('XP updated for fast:', fastId);

    // End the fast
    await updateFastStatus(fastId, 'completed', new Date().toISOString());
    console.log('Fast completed');

    // Get all fasts to see the history
    const allFasts = await getFasts();
    console.log('Total fasts:', allFasts.length);
    console.log('Latest fast:', allFasts[0]);

  } catch (error) {
    console.error('Failed to track fast:', error);
  }
};

/**
 * Example: Unlock achievements
 */
export const unlockAchievements = async () => {
  try {
    // Check if achievement is already unlocked
    const hasFirstFast = await hasAchievement('first_fast');
    console.log('Has first fast achievement:', hasFirstFast);

    if (!hasFirstFast) {
      // Unlock the achievement
      await unlockAchievement('first_fast');
      console.log('First fast achievement unlocked!');
    }

    // Unlock more achievements
    await unlockAchievement('fast_16_hours');
    await unlockAchievement('total_10_fasts');

    // Get all achievements
    const achievements = await getAchievements();
    console.log('Total achievements:', achievements.length);
    console.log('Achievements:', achievements.map(a => a.id));

  } catch (error) {
    console.error('Failed to unlock achievements:', error);
  }
};

/**
 * Example: Update user stats
 */
export const updateUserStats = async () => {
  try {
    // Add XP to user
    await updateUserXP(150);
    console.log('User XP updated to 150');

    // Update streak
    await updateUserStreak(5);
    console.log('User streak updated to 5');

    // Get updated user profile
    const user = await getUser();
    console.log('Updated user:', user);

  } catch (error) {
    console.error('Failed to update user stats:', error);
  }
};

/**
 * Example: Get active fast and check status
 */
export const checkActiveFast = async () => {
  try {
    const activeFast = await getActiveFast();
    
    if (activeFast) {
      console.log('Active fast found:', {
        id: activeFast.id,
        planId: activeFast.planId,
        startTime: activeFast.startTime,
        status: activeFast.status,
        xpEarned: activeFast.xpEarned,
      });

      // Calculate duration
      const startTime = new Date(activeFast.startTime);
      const now = new Date();
      const durationMs = now.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      console.log(`Fast duration: ${durationHours}h ${durationMinutes}m`);
    } else {
      console.log('No active fast found');
    }

  } catch (error) {
    console.error('Failed to check active fast:', error);
  }
};

/**
 * Example: Sync data (for future cloud integration)
 */
export const syncData = async () => {
  try {
    // Get unsynced data
    const unsyncedFasts = await getUnsyncedFasts();
    const unsyncedAchievements = await getUnsyncedAchievements();
    
    console.log('Unsynced fasts:', unsyncedFasts.length);
    console.log('Unsynced achievements:', unsyncedAchievements.length);

    // Simulate syncing to cloud
    if (unsyncedFasts.length > 0) {
      console.log('Syncing fasts to cloud...');
      // await syncFastsToCloud(unsyncedFasts);
      
      // Mark as synced after successful upload
      for (const fast of unsyncedFasts) {
        await markAsSynced('fasts', fast.id!);
      }
    }

    if (unsyncedAchievements.length > 0) {
      console.log('Syncing achievements to cloud...');
      // await syncAchievementsToCloud(unsyncedAchievements);
      
      // Mark as synced after successful upload
      for (const achievement of unsyncedAchievements) {
        await markAsSynced('achievements', achievement.id);
      }
    }

    console.log('Sync completed');

  } catch (error) {
    console.error('Failed to sync data:', error);
  }
};

/**
 * Example: Get database statistics
 */
export const getStats = async () => {
  try {
    const stats = await getDatabaseStats();
    console.log('Database stats:', stats);
    
    // Get user profile
    const user = await getUser();
    if (user) {
      console.log('User profile:', {
        username: user.username,
        totalXP: user.totalXP,
        streak: user.streak,
        synced: user.synced,
      });
    }

    // Get recent fasts
    const recentFasts = await getFasts();
    const completedFasts = recentFasts.filter(f => f.status === 'completed');
    console.log(`Completed fasts: ${completedFasts.length}`);

  } catch (error) {
    console.error('Failed to get stats:', error);
  }
};

/**
 * Example: Complete workflow - Start fast, complete it, earn XP, unlock achievements
 */
export const completeFastWorkflow = async () => {
  try {
    console.log('=== Starting Complete Fast Workflow ===');

    // 1. Start a fast
    const fastId = await addFast({
      planId: '16:8',
      startTime: new Date().toISOString(),
      status: 'active',
      xpEarned: 0,
    });
    console.log('✅ Fast started:', fastId);

    // 2. Simulate fast completion (in real app, this would be triggered by user action)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate time passing

    // 3. Complete the fast and award XP
    await updateFastStatus(fastId, 'completed', new Date().toISOString());
    await updateFastXP(fastId, 75);
    console.log('✅ Fast completed with 75 XP');

    // 4. Update user total XP
    const user = await getUser();
    if (user) {
      await updateUserXP(user.totalXP + 75);
      console.log('✅ User XP updated');
    }

    // 5. Unlock achievements based on completion
    await unlockAchievement('first_fast');
    await unlockAchievement('fast_16_hours');
    console.log('✅ Achievements unlocked');

    // 6. Update streak
    if (user) {
      await updateUserStreak(user.streak + 1);
      console.log('✅ Streak updated');
    }

    // 7. Get final stats
    const finalStats = await getDatabaseStats();
    console.log('✅ Final stats:', finalStats);

    console.log('=== Fast Workflow Completed Successfully ===');

  } catch (error) {
    console.error('❌ Fast workflow failed:', error);
  }
};

/**
 * Example: Reset all data (useful for testing)
 */
export const resetAllData = async () => {
  try {
    await clearAllData();
    console.log('All data cleared');
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

// Export all examples for easy testing
export const examples = {
  initializeApp,
  startAndTrackFast,
  unlockAchievements,
  updateUserStats,
  checkActiveFast,
  syncData,
  getStats,
  completeFastWorkflow,
  resetAllData,
};

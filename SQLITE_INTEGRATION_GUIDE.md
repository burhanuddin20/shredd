# SQLite Integration Guide for Shredd App

## 📋 Overview

The Shredd app now has full SQLite integration for local data persistence. This guide shows you how to use the database functions and provides examples for common operations.

## 🗄️ Database Schema

### Tables Created

1. **`fasts`** - Stores fasting sessions

   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `planId` (TEXT) - e.g., "16:8", "18:6"
   - `startTime` (TEXT) - ISO string
   - `endTime` (TEXT) - ISO string (nullable)
   - `status` (TEXT) - "active", "completed", "cancelled", "paused"
   - `xpEarned` (INTEGER) - XP earned from this fast
   - `synced` (BOOLEAN) - Sync status for cloud integration

2. **`achievements`** - Unlocked achievements

   - `id` (TEXT PRIMARY KEY) - Achievement identifier
   - `unlockedAt` (TEXT) - ISO string when unlocked
   - `synced` (BOOLEAN) - Sync status

3. **`user`** - Basic profile info
   - `id` (TEXT PRIMARY KEY) - User identifier
   - `username` (TEXT) - Display name
   - `email` (TEXT) - Email (nullable)
   - `totalXP` (INTEGER) - Total XP earned
   - `streak` (INTEGER) - Current streak
   - `synced` (BOOLEAN) - Sync status

## 🚀 Quick Start

### 1. Database Initialization

The database is automatically initialized when the app starts via the `DatabaseProvider`:

```typescript
// Already integrated in app/_layout.tsx
<DatabaseProvider>{/* Your app components */}</DatabaseProvider>
```

### 2. Using the Hooks

#### Fasting Hook

```typescript
import { useFasting } from "@/src/hooks/useFasting";

const MyComponent = () => {
  const { currentFast, fastHistory, startFast, endFast, pauseFast, isLoading } =
    useFasting();

  const handleStartFast = async () => {
    await startFast("16:8"); // Start a 16:8 fast
  };

  const handleEndFast = async () => {
    if (currentFast) {
      await endFast(currentFast.id!, 50); // End fast and award 50 XP
    }
  };
};
```

#### User Profile Hook

```typescript
import { useUserProfile } from "@/src/hooks/useUserProfile";

const MyComponent = () => {
  const { userProfile, achievements, addXP, unlockAchievement, isLoading } =
    useUserProfile();

  const handleUnlockAchievement = async () => {
    await unlockAchievement("first_fast");
  };

  const handleAddXP = async () => {
    await addXP(100); // Add 100 XP
  };
};
```

## 📚 Common Usage Examples

### Starting a Fast

```typescript
import { addFast } from "@/src/lib/db";

const startNewFast = async () => {
  try {
    const fastId = await addFast({
      planId: "16:8",
      startTime: new Date().toISOString(),
      status: "active",
      xpEarned: 0,
    });

    console.log("Fast started with ID:", fastId);
  } catch (error) {
    console.error("Failed to start fast:", error);
  }
};
```

### Completing a Fast

```typescript
import { updateFastStatus, updateFastXP } from "@/src/lib/db";

const completeFast = async (fastId: number, xpEarned: number) => {
  try {
    // Mark as completed
    await updateFastStatus(fastId, "completed", new Date().toISOString());

    // Award XP
    await updateFastXP(fastId, xpEarned);

    console.log("Fast completed successfully");
  } catch (error) {
    console.error("Failed to complete fast:", error);
  }
};
```

### Unlocking Achievements

```typescript
import { unlockAchievement, hasAchievement } from "@/src/lib/db";

const checkAndUnlockAchievements = async (totalFasts: number) => {
  // Check if user has completed their first fast
  if (totalFasts >= 1) {
    const hasFirstFast = await hasAchievement("first_fast");
    if (!hasFirstFast) {
      await unlockAchievement("first_fast");
      console.log("First fast achievement unlocked!");
    }
  }
};
```

### Getting User Data

```typescript
import { getUser, getFasts, getAchievements } from "@/src/lib/db";

const loadUserData = async () => {
  try {
    const [user, fasts, achievements] = await Promise.all([
      getUser(),
      getFasts(),
      getAchievements(),
    ]);

    console.log("User:", user);
    console.log("Total fasts:", fasts.length);
    console.log("Achievements:", achievements.length);
  } catch (error) {
    console.error("Failed to load user data:", error);
  }
};
```

## 🔄 Integration Points

### Onboarding Flow

- User data is automatically saved to SQLite when completing onboarding
- Username and selected plan are stored in the database

### Profile Screen

- Now loads real user data from SQLite instead of mock data
- Shows actual achievements and user stats
- Displays loading state while database initializes

### Future Integrations

- Timer screen can use `useFasting` hook to manage active fasts
- History screen can display real fast history from database
- Leaderboard can sync user stats to cloud when ready

## 🛠️ Advanced Features

### Sync Support (Future-Ready)

All database operations mark records as `synced: false` when modified locally:

```typescript
import { getUnsyncedFasts, markAsSynced } from "@/src/lib/db";

const syncToCloud = async () => {
  // Get unsynced data
  const unsyncedFasts = await getUnsyncedFasts();

  // Sync to cloud
  for (const fast of unsyncedFasts) {
    // await uploadToCloud(fast);
    await markAsSynced("fasts", fast.id!);
  }
};
```

### Database Statistics

```typescript
import { getDatabaseStats } from "@/src/lib/db";

const getStats = async () => {
  const stats = await getDatabaseStats();
  console.log("Database stats:", stats);
  // Output: { fasts: 15, achievements: 8, users: 1 }
};
```

### Testing Support

```typescript
import { clearAllData } from "@/src/lib/db";

// Clear all data for testing
const resetDatabase = async () => {
  await clearAllData();
  console.log("All data cleared");
};
```

## 📁 File Structure

```
src/
├── lib/
│   ├── db.ts                    # Main database utility
│   └── DatabaseProvider.tsx     # Database initialization
├── hooks/
│   ├── useFasting.ts           # Fasting operations hook
│   └── useUserProfile.ts       # User profile operations hook
└── examples/
    └── database-usage.ts       # Comprehensive usage examples
```

## 🎯 Next Steps

1. **Integrate with Timer Screen**: Use `useFasting` hook to manage active fasts
2. **Update History Screen**: Display real fast history from database
3. **Add Cloud Sync**: Implement sync functions when backend is ready
4. **Performance Optimization**: Add caching and pagination for large datasets
5. **Data Migration**: Handle app updates and schema changes

## 🐛 Troubleshooting

### Database Not Initialized

```typescript
import { useDatabase } from "@/src/lib/DatabaseProvider";

const MyComponent = () => {
  const { isInitialized, error } = useDatabase();

  if (!isInitialized) {
    return <Text>Loading database...</Text>;
  }

  if (error) {
    return <Text>Database error: {error}</Text>;
  }

  // Safe to use database functions
};
```

### Common Errors

- **Database not initialized**: Ensure `DatabaseProvider` wraps your app
- **Async/await issues**: All database functions return Promises
- **Type errors**: Use the provided TypeScript interfaces (`Fast`, `Achievement`, `UserProfile`)

## 📖 Complete Examples

See `src/examples/database-usage.ts` for comprehensive examples of all database operations including:

- Complete fast workflow
- Achievement unlocking
- User stats management
- Sync operations
- Error handling

The SQLite integration is now ready for production use! 🚀

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from './db';

interface DatabaseContextType {
    isInitialized: boolean;
    error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
    isInitialized: false,
    error: null,
});

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};

interface DatabaseProviderProps {
    children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeDb = async () => {
            try {
                await initDatabase();
                setIsInitialized(true);
                console.log('Database initialized successfully');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
                setError(errorMessage);
                console.error('Database initialization failed:', err);
            }
        };

        initializeDb();
    }, []);

    return (
        <DatabaseContext.Provider value={{ isInitialized, error }}>
            {children}
        </DatabaseContext.Provider>
    );
};

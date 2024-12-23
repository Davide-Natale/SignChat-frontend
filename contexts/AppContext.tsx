import React, { createContext, useState } from "react"

interface AppContextType {
    isReady: boolean,
    updateIsReady: (ready: boolean) => void
    loading: boolean,
    updateLoading: (loading: boolean) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <AppContext.Provider value={{ isReady, updateIsReady: setIsReady, loading, updateLoading: setLoading }}>
            {children}
        </AppContext.Provider>
    );
};
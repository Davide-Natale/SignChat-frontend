import { getPreference, savePreference } from "@/utils/asyncStorage";
import React, { createContext, useEffect, useState } from "react"

interface AppContextType {
    isReady: boolean;
    updateIsReady: (ready: boolean) => void;
    loading: boolean;
    updateLoading: (loading: boolean) => void;
    isAccessibilityEnabled: boolean | null;
    updateAccessibility: (value: boolean) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState<boolean | null>(null);
    
    useEffect(() => {
        const loadAccessibilityPreference = async () => {
            try {
                //  Read preference from Async Storage
                const accessibilityPreference = await getPreference('accessibility');
    
                //  Update preference state
                setIsAccessibilityEnabled(accessibilityPreference);
            } catch (error) {
                //  No need to do anything: unable to retreive accessibility preference
            }
        };

        loadAccessibilityPreference();
    }, []);

    const updateAccessibility = async (value: boolean) => {
        try {
            setIsAccessibilityEnabled(value);
            await savePreference('accessibility', value);
        } catch (error) {
            setIsAccessibilityEnabled(!value);
            throw error;
        }
    };

    return(
        <AppContext.Provider value={
            { 
                isReady, 
                updateIsReady: setIsReady, 
                loading, 
                updateLoading: setLoading,
                isAccessibilityEnabled,
                updateAccessibility
            }
        }>
            {children}
        </AppContext.Provider>
    );
};
import { getPreference, savePreference } from "@/utils/asyncStorage";
import React, { createContext, useEffect, useState } from "react"

interface AppContextType {
    isReady: boolean,
    updateIsReady: (ready: boolean) => void
    loading: boolean,
    updateLoading: (loading: boolean) => void
    isNotificationsEnabled: boolean | null
    updateNotifications: (value: boolean) => Promise<void>
    isAccessibilityEnabled: boolean | null
    updateAccessibility: (value: boolean) => Promise<void>
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean | null>(null);
    const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState<boolean | null>(null);
    
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                //  Read preferences from Async Storage
                const notificationsPreference = await getPreference('pushNotifications');
                const accessibilityPreference = await getPreference('accessibility');
    
                //  Update states
                setIsNotificationsEnabled(notificationsPreference);
                setIsAccessibilityEnabled(accessibilityPreference);
            } catch (error) {
                //  No need to do anything: unable to retreive preferences
            }
        };

        loadPreferences();
    }, []);

    const updateNotifications = async (value: boolean) => {
        try {
            setIsNotificationsEnabled(value);
            await savePreference('pushNotifications', value);
        } catch (error) {
            setIsNotificationsEnabled(!value);
            throw error;
        }
    };

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
                isNotificationsEnabled,
                updateNotifications,
                isAccessibilityEnabled,
                updateAccessibility
            }
        }>
            {children}
        </AppContext.Provider>
    );
};
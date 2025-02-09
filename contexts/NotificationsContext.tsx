import { getPreference, removePreference, savePreference } from "@/utils/asyncStorage";
import React, { createContext, useEffect, useRef, useState } from "react";
import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import tokensAPI from "@/api/tokensAPI";

interface NotificationsContextType {
    notification: Notifications.Notification | undefined;
    isNotificationsEnabled: boolean | null;
    initializeNotifications: () => Promise<void>;
    updateNotifications: (value: boolean) => Promise<void>;
    handleLogout: () => Promise<void>;
    handleDeleteAccount: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expoToken, setExpoToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification>();
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        const loadNotificationsPreference = async () => {
            try {
                //  Read preference from Async Storage
                const notificationsPreference = await getPreference('pushNotifications');

                //  Update preference state
                setIsNotificationsEnabled(notificationsPreference);
            } catch (error) {
                //  No need to do anything: unable to retreive notifications preference
            }
        };

        loadNotificationsPreference();
    }, []);

    useEffect(() => {
        const configureNotifications = async () => {
            //  Set up notifications handler
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                }),
            });

            //  Set up notifications channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250]
                });
            }
        };
        
        configureNotifications();
    }, []);

    useEffect(() => {
        if(isNotificationsEnabled) {
          notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notifica ricevuta:", notification);
            setNotification(notification);
          });
    
          responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("L'utente ha interagito con la notifica:", JSON.stringify( 
                response.notification.request.content, null, 2
            ));
          });
        } else {
          if(notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
            notificationListener.current = undefined;
          }

          if(responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
            responseListener.current = undefined;
          }
        }
    
        return () => {
          if(notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
            notificationListener.current = undefined;
          }

          if(responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
            responseListener.current = undefined;
          }
        };
      }, [isNotificationsEnabled]);

    const initializeNotifications = async () => {
        if(isNotificationsEnabled) {
            const token = await registerForPushNotificationsAsync();
            setExpoToken(token);
        } else {
            try {
                await updateNotifications(true);
            } catch (error) {
                await savePreference('pushNotifications', false);
                throw error;
            }
        }
    };

    const updateNotifications = async (value: boolean) => {
        try {
            setIsNotificationsEnabled(value);

            if(value) {
                const token = await registerForPushNotificationsAsync();
                await tokensAPI.createToken(token);
                setExpoToken(token);
            } else {
                await tokensAPI.deleteToken(expoToken ?? '');
                setExpoToken(null);
            }

            await savePreference('pushNotifications', value);
        } catch (error) {
            setIsNotificationsEnabled(!value);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            if(isNotificationsEnabled) {
                await tokensAPI.deleteToken(expoToken ?? '');
                setExpoToken(null);
            }
        } catch (error) {
            throw error;
        } finally {
            await removePreference('pushNotifications');
            setIsNotificationsEnabled(null);
        }
    };

    const handleDeleteAccount = async () => {
        if(expoToken) setExpoToken(null);
        await removePreference('pushNotifications');
        setIsNotificationsEnabled(null);
    };

    return(
        <NotificationsContext.Provider value={
            {
                notification,
                isNotificationsEnabled,
                initializeNotifications,
                updateNotifications,
                handleLogout,
                handleDeleteAccount
            }
        }>
            {children}
        </NotificationsContext.Provider>
    );
};
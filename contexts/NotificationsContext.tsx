import { getPreference, removePreference, savePreference } from "@/utils/asyncStorage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { deleteToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import { messaging, registerForPushNotificationsAsync } from "@/utils/firebaseMessaging";
import tokensAPI from "@/api/tokensAPI";
import { showIncomingCall } from "@/utils/callKeep";
import DeviceInfo from 'react-native-device-info';
import { displayNotification } from "@/utils/notifications";
import notifee, { EventType } from '@notifee/react-native';

interface NotificationsContextType {
    isNotificationsEnabled: boolean | null;
    initializeNotifications: () => Promise<void>;
    updateNotifications: (value: boolean) => Promise<void>;
    handleLogout: () => Promise<void>;
    handleDeleteAccount: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean | null>(null);
    const unsubscribeMessageListener = useRef<() => void>();
    const unsubscribeNotificationListener = useRef<() => void>();
    const unsubscribeRefreshListener = useRef<() => void>();

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
        if(isNotificationsEnabled) {
            unsubscribeMessageListener.current = onMessage(messaging, async message => {
                if(message.data?.notifee) {
                    await displayNotification(typeof message.data.notifee === 'string' ?
                        JSON.parse(message.data.notifee) :
                        message.data.notifee
                    );
                } else if(message.data?.type === 'incoming-call') {
                    showIncomingCall('2', '1234', 'Lorenzo Lenti');
                }
            }); 

            unsubscribeNotificationListener.current = notifee.onForegroundEvent(({ type, detail }) => {
                if(type === EventType.PRESS) {
                    //  TODO: you might want to redirect user to correct route
                    console.log("Foreground Notification pressed");
                    console.log(JSON.stringify(detail.notification));
                }
            });

            unsubscribeRefreshListener.current = onTokenRefresh(messaging, async token => {
                try {
                    const deviceId = await DeviceInfo.getUniqueId();
                    await tokensAPI.syncToken(token, deviceId);
                    setFcmToken(token);
                } catch (error) {
                    //  No need to do anything
                }
            });
        } else {
          if(unsubscribeMessageListener.current) {
            unsubscribeMessageListener.current();
            unsubscribeMessageListener.current = undefined;
          }

          if(unsubscribeNotificationListener.current) {
            unsubscribeNotificationListener.current();
            unsubscribeNotificationListener.current = undefined;
          }

          if(unsubscribeRefreshListener.current) {
            unsubscribeRefreshListener.current();
            unsubscribeRefreshListener.current = undefined;
          }
        }
    
        return () => {
            if(unsubscribeMessageListener.current) {
                unsubscribeMessageListener.current();
                unsubscribeMessageListener.current = undefined;
            }

            if(unsubscribeNotificationListener.current) {
                unsubscribeNotificationListener.current();
                unsubscribeNotificationListener.current = undefined;
              }

            if(unsubscribeRefreshListener.current) {
                unsubscribeRefreshListener.current();
                unsubscribeRefreshListener.current = undefined;
            }
        };
      }, [isNotificationsEnabled]);

    const initializeNotifications = async () => {
        if(isNotificationsEnabled) {
            const deviceId = await DeviceInfo.getUniqueId();
            const token = await registerForPushNotificationsAsync();

            await tokensAPI.syncToken(token, deviceId);
            setFcmToken(token);
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
                const deviceId = await DeviceInfo.getUniqueId();
                const token = await registerForPushNotificationsAsync();

                await tokensAPI.createToken(token, deviceId);
                setFcmToken(token);
            } else {
                await tokensAPI.deleteToken(fcmToken ?? '');
                await deleteToken(messaging);
                setFcmToken(null);
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
                await tokensAPI.deleteToken(fcmToken ?? '');
                await deleteToken(messaging);
                setFcmToken(null);
            }
        } catch (error) {
            throw error;
        } finally {
            await removePreference('pushNotifications');
            setIsNotificationsEnabled(null);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            if(fcmToken) {
                await deleteToken(messaging);
                setFcmToken(null);
            }
        } catch (error) {
            throw error;
        } finally {
            await removePreference('pushNotifications');
            setIsNotificationsEnabled(null);
        } 
    };

    return(
        <NotificationsContext.Provider value={
            {
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
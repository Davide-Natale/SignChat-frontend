import { getPreference, removePreference, savePreference } from "@/utils/asyncStorage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { deleteToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import { messaging, registerForPushNotificationsAsync } from "@/utils/firebaseMessaging";
import tokensAPI from "@/api/tokensAPI";
import DeviceInfo from 'react-native-device-info';
import { displayIncomingCallNotification, displayNotification } from "@/utils/notifications";
import notifee, { EventType } from '@notifee/react-native';
import InCallManager from 'react-native-incall-manager';
import { router } from 'expo-router';
import { Contact } from "@/types/Contact";
import { CustomUser } from "@/types/User";

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
                    InCallManager.startRingtone('_DEFAULT_', [1000, 2000], 'PlayAndRecord', 30)
                    await displayIncomingCallNotification(message.data);
                } else if(message.data?.type === 'incoming-call-handled') {
                    const callId = message.data.callId as string;
                    InCallManager.stopRingtone();
                    notifee.cancelNotification(callId);
                }
            }); 

            unsubscribeNotificationListener.current = notifee.onForegroundEvent(({ type, detail }) => {
                if(type === EventType.PRESS) {
                    if(detail.notification?.data?.type === 'missed-call') {
                        const callId = detail.notification.data.callId as string;
                        router.push({ pathname: '/calls/[id]', params: { id: callId } });
                    } else if(detail.notification?.data?.type === 'incoming-call') {
                        const callId = detail.notification.data.callId as string;
                        const contact = detail.notification.data.contact && typeof detail.notification.data.contact === 'string' ? 
                            JSON.parse(detail.notification.data.contact) as Contact : detail.notification.data.contact ? 
                                detail.notification.data.contact as Contact : undefined;
                        const user = detail.notification.data.user && typeof detail.notification.data.user === 'string' ? 
                            JSON.parse(detail.notification.data.user) as CustomUser : detail.notification.data.user ? 
                                detail.notification.data.user as CustomUser : undefined;

                        router.push({ 
                            pathname: '/video-call/incoming', 
                            params: { 
                                callId,
                                contactId: contact ? contact.id : undefined,
                                userId: user ? user.id : undefined
                            } 
                        });
                    }
                } else if(type === EventType.ACTION_PRESS && detail.pressAction?.id === 'reject') {
                    console.log('Chiamata rifiutata');
                    InCallManager.stopRingtone();
                    notifee.cancelNotification(detail.notification?.id ?? "");
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
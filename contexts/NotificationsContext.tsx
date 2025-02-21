import { getPreference, removePreference, savePreference } from "@/utils/asyncStorage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { deleteToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import { messaging, registerForPushNotificationsAsync } from "@/utils/firebaseMessaging";
import tokensAPI from "@/api/tokensAPI";
import DeviceInfo from 'react-native-device-info';
import { displayNotification } from "@/utils/notifications";
import notifee, { AndroidCategory, AndroidImportance, EventType } from '@notifee/react-native';
import InCallManager from 'react-native-incall-manager';
import dayjs from "dayjs";

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
                    const callUUID = '2'; //    TODO: fix this
        console.log('Chiamata in arrivo', callUUID);

        InCallManager.startRingtone('_DEFAULT_', [1000, 2000], 'PlayAndRecord', 30)

        //  Create a channel
        const channelId = await notifee.createChannel({
            id: 'incoming-calls',
            name: 'Incoming Calls Channel',
            badge: false,
            importance: AndroidImportance.HIGH
        });

        await notifee.displayNotification({
            id: callUUID,
            title: 'Lorenzo Lenti', //  TODO: fix this
            body: 'Incoming Video Call',
            android: {
                channelId,
                color: '#007cff',
                smallIcon: 'notification_icon',
                importance: AndroidImportance.HIGH,
                category: AndroidCategory.CALL,
                autoCancel: false,
                ongoing: true,
                lightUpScreen: true,
                circularLargeIcon: true,
                largeIcon: 'http://192.168.178.183:3000/uploads/1737924911737-348673612.png',
                showTimestamp: true,
                timestamp: dayjs().valueOf(),
                fullScreenAction: {
                    id: 'default'
                },
                pressAction: {
                    id: 'default',
                    mainComponent: 'profile'
                },
                actions: [
                    {

                        title: '✅ Rispondi',
                        pressAction: { id: 'answer' },
                    },
                    {
                        title: '❌ Rifiuta',
                        pressAction: { id: 'reject' },
                    },
                ],
            },
        });
                }
            }); 

            unsubscribeNotificationListener.current = notifee.onForegroundEvent(({ type, detail }) => {
                if(type === EventType.PRESS) {
                    //  TODO: you might want to redirect user to correct route
                    console.log("Foreground Notification pressed");
                    console.log(JSON.stringify(detail.notification));
                } else if(type === EventType.ACTION_PRESS && detail.pressAction?.id === 'reject') {
                    console.log('Chiamata rifiutata');
                    InCallManager.stopRingtone();
                    notifee.cancelDisplayedNotification(detail.notification?.id ?? "");
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
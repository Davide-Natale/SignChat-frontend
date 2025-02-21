import 'expo-router/entry';
import { messaging } from './utils/firebaseMessaging';
import { setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidCategory, AndroidImportance, EventType } from '@notifee/react-native';
import { displayNotification } from './utils/notifications';
import InCallManager from 'react-native-incall-manager';
import dayjs from 'dayjs';

setBackgroundMessageHandler(messaging, async message => {
    if (message.data?.notifee) {
        await displayNotification(typeof message.data.notifee === 'string' ?
            JSON.parse(message.data.notifee) :
            message.data.notifee
        );
    } else if (message.data?.type === 'incoming-call') {
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

notifee.onBackgroundEvent(async ({ type, detail }) => {
    if(type === EventType.PRESS) {
        //  TODO: you might want to redirect user to correct route
        console.log("Backgroud notification pressed");
        console.log(JSON.stringify(detail.notification));
    } else if(type === EventType.ACTION_PRESS && detail.pressAction?.id === 'reject') {
        console.log('Chiamata rifiutata');
        InCallManager.stopRingtone();
        notifee.cancelDisplayedNotification(detail.notification?.id ?? "");
    }
});
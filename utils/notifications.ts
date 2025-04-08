import { Contact } from '@/types/Contact';
import { CustomUser } from '@/types/User';
import notifee, { AndroidCategory, AndroidImportance } from '@notifee/react-native';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import DeviceInfo from 'react-native-device-info';
import { socket } from '@/utils/webSocket';
import InCallManager from 'react-native-incall-manager';

type Data = { [key: string]: string | number | object; };

interface MessagePayload {
    title: string;
    body: string;
    imageProfile?: string;
    data?: Data;
}

interface Options {
    id: string;
    title: string;
    body: string;
    imageProfile?: string | null;
    data: Data;
    showChronometer: boolean;
    showTimestamp: boolean;
}

export const displayNotification = async (messagePayload: MessagePayload) => {
    const { title, body, imageProfile, data } = messagePayload;
    const placeholder = require("@/assets/images/profile-placeholder-light.png");

    //  Create a channel
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        sound: 'default',
        importance: AndroidImportance.HIGH
    });

    //  Display notification
    await notifee.displayNotification({
        title,
        body,
        data,
        android: {
            channelId,
            color: '#007cff',
            smallIcon: 'notification_icon',
            circularLargeIcon: true,
            largeIcon: imageProfile ?? placeholder,
            showTimestamp: true,
            timestamp: dayjs().valueOf(),
            pressAction: {
                id: 'default'
            }
        }
    });
};

export const displayIncomingCallNotification = async (data: Data) => {
    const callId = data.callId as string;
    const contact = data.contact && typeof data.contact === 'string' ? JSON.parse(data.contact) as Contact : 
        data.contact ? data.contact as Contact : undefined;
    const user = data.user && typeof data.user === 'string' ? JSON.parse(data.user) as CustomUser : 
        data.user ? data.user as CustomUser : undefined;
    const fullName = contact ? `${contact.firstName} ${contact.lastName || ''}`.trim() :
        user ? `${user.firstName} ${user.lastName}` : "";
    const imageProfile = contact ? contact.user?.imageProfile : user?.imageProfile;
    const placeholder = require("@/assets/images/profile-placeholder-light.png");

    //  Create a channel
    const channelId = await notifee.createChannel({
        id: 'incoming-calls',
        name: 'Incoming Calls Channel',
        badge: false,
        importance: AndroidImportance.HIGH
    });

    await notifee.displayNotification({
        id: callId,
        title: fullName,
        body: 'Incoming Video Call',
        data,
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
            largeIcon: imageProfile ?? placeholder,
            showTimestamp: true,
            timestamp: dayjs().valueOf(),
            pressAction: {
                id: 'default'
            },
            actions: [
                {
                    title: '<p style="color: #FF4D4D"><b>Decline</b></p>',
                    pressAction: { id: 'decline' },
                },
                {
                    title: '<p style="color: #4CAF50"><b>Accept</b></p>',
                    pressAction: { id: 'accept', launchActivity: 'default' },
                }
            ],
        },
    });
};

export const displayOngoingCallNotification = async ({ id, title, body, imageProfile, data, showChronometer, showTimestamp }: Options) => {
    const placeholder = require("@/assets/images/profile-placeholder-light.png");

    //  Create a channel
    const channelId = await notifee.createChannel({
        id: 'ongoing-calls',
        name: 'Ongoing Calls Channel',
        badge: false,
        importance: AndroidImportance.DEFAULT
    });

    await notifee.displayNotification({
        id,
        title,
        body,
        data,
        android: {
            channelId,
            color: '#007cff',
            smallIcon: 'notification_icon',
            importance: AndroidImportance.DEFAULT,
            category: AndroidCategory.CALL,
            autoCancel: false,
            ongoing: true,
            circularLargeIcon: true,
            largeIcon: imageProfile ?? placeholder,
            showChronometer,
            showTimestamp,
            timestamp: dayjs().valueOf(),
            pressAction: {
                id: 'default'
            },
            actions: [
                {
                    title: '<p style="color: #FF4D4D"><b>Hang Up</b></p>',
                    pressAction: { id: 'hang-up' },
                }
            ],
        },
    });
};

export const checkInitialNotification = async () => {
    const initialNotification = await notifee.getInitialNotification();
    if(!initialNotification) return;

    if(initialNotification.notification.data?.type === 'missed-call') {
        const callId = initialNotification.notification.data.callId as string;
        router.push({ pathname: '/calls/[id]', params: { id: callId } });
    } else if(initialNotification.notification.data?.type === 'incoming-call') {
        const deviceId = await DeviceInfo.getUniqueId();
        const callId = initialNotification.notification.data.callId as string;
        const contact = initialNotification.notification.data.contact && typeof initialNotification.notification.data.contact === 'string' ?
            JSON.parse(initialNotification.notification.data.contact) as Contact : initialNotification.notification.data.contact ?
                initialNotification.notification.data.contact as Contact : undefined;
        const user = initialNotification.notification.data.user && typeof initialNotification.notification.data.user === 'string' ?
            JSON.parse(initialNotification.notification.data.user) as CustomUser : initialNotification.notification.data.user ?
                initialNotification.notification.data.user as CustomUser : undefined;

        if(initialNotification.pressAction.id === 'accept') {
            socket.emit("answer-call", { 
                callId,
                callerUserId: contact?.user ? contact.user.id : user?.id,
                deviceId
            });
            InCallManager.stopRingtone();
            notifee.cancelNotification(callId.toString());
            InCallManager.start({ media: 'video' });
            router.push({
                pathname: '/video-call', 
                params: { 
                    contactId: contact ? contact.id : undefined, 
                    userId: !contact ? user?.id : undefined
                } 
            });
        } else {
            router.push({
                pathname: '/video-call/incoming',
                params: {
                    callId,
                    contactId: contact ? contact.id : undefined,
                    userId: user ? user.id : undefined
                }
            });
        } 
    }
};
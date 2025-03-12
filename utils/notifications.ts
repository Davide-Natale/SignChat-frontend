import { Contact } from '@/types/Contact';
import { CustomUser } from '@/types/User';
import notifee, { AndroidCategory, AndroidImportance } from '@notifee/react-native';
import dayjs from 'dayjs';
import { router } from 'expo-router';

type Data = { [key: string]: string | number | object; };

interface MessagePayload {
    title: string;
    body: string;
    imageProfile?: string;
    data?: Data;
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
    await notifee.displayNotification({ //  TODO: add recall button in case of missed calls
        title,
        body,
        data,
        android: {
            channelId,
            color: '#007cff',
            smallIcon: 'notification_icon',
            circularLargeIcon: true,
            largeIcon: imageProfile ?? placeholder,
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
            fullScreenAction: {
                id: 'default',
                mainComponent: 'IncomingVideoCall'
            },
            pressAction: {
                id: 'default'
            },
            actions: [
                {
                    title: '<p style="color: #FF4D4D"><b>Decline</b></p>',
                    pressAction: { id: 'reject' },
                },
                {

                    title: '<p style="color: #4CAF50"><b>Accept</b></p>',
                    pressAction: { id: 'answer' },
                }
            ],
        },
    });
};

export const checkInitialNotification = async () => {
    const initialNotification = await notifee.getInitialNotification();

    if(initialNotification && initialNotification.notification.data?.type === 'missed-call') {
        const callId = initialNotification.notification.data.callId as string;
        router.push({ pathname: '/calls/[id]', params: { id: callId } });
    }
};
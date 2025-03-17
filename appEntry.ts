import 'expo-router/entry';
import { messaging } from './utils/firebaseMessaging';
import { setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayIncomingCallNotification, displayNotification } from './utils/notifications';
import InCallManager from 'react-native-incall-manager';
import { router } from 'expo-router';
import { Contact } from "@/types/Contact";
import { CustomUser } from "@/types/User";
import DeviceInfo from 'react-native-device-info';
import { socket } from './utils/webSocket';

setBackgroundMessageHandler(messaging, async message => {
    if(message.data?.notifee) {
        await displayNotification(typeof message.data.notifee === 'string' ?
            JSON.parse(message.data.notifee) :
            message.data.notifee
        );
    } else if(message.data?.type === 'incoming-call') {
        InCallManager.startRingtone('_DEFAULT_', [1000, 2000], 'PlayAndRecord', 30);
        await displayIncomingCallNotification(message.data);
    } else if(message.data?.type === 'incoming-call-handled') {
        const callId = message.data.callId as string;
        InCallManager.stopRingtone();
        notifee.cancelNotification(callId);
    }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
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
    } else if(type === EventType.ACTION_PRESS) {    //  TODO: fix this because socket isn't already connected when app is killed
        if(detail.pressAction?.id === 'decline') {
            const deviceId = await DeviceInfo.getUniqueId();
            const callId = detail.notification?.data?.callId as string;
            const contact = detail.notification?.data?.contact && typeof detail.notification.data.contact === 'string' ? 
                JSON.parse(detail.notification.data.contact) as Contact : detail.notification?.data?.contact ? 
                    detail.notification.data.contact as Contact : undefined;
            const user = detail.notification?.data?.user && typeof detail.notification.data.user === 'string' ? 
                JSON.parse(detail.notification.data.user) as CustomUser : detail.notification?.data?.user ? 
                    detail.notification?.data?.user as CustomUser : undefined;

            socket.emit("reject-call", { 
                callId,
                callerUserId: contact?.user ? contact.user.id : user?.id,
                deviceId
            });
            InCallManager.stopRingtone();
            notifee.cancelNotification(callId.toString());
        } else if(detail.pressAction?.id === 'accept') {
            const deviceId = await DeviceInfo.getUniqueId();
            const callId = detail.notification?.data?.callId as string;
            const contact = detail.notification?.data?.contact && typeof detail.notification.data.contact === 'string' ? 
                JSON.parse(detail.notification.data.contact) as Contact : detail.notification?.data?.contact ? 
                    detail.notification.data.contact as Contact : undefined;
            const user = detail.notification?.data?.user && typeof detail.notification.data.user === 'string' ? 
                JSON.parse(detail.notification.data.user) as CustomUser : detail.notification?.data?.user ? 
                    detail.notification?.data?.user as CustomUser : undefined;

            socket.emit("answer-call", { 
                callId,
                callerUserId: contact?.user ? contact.user.id : user?.id,
                deviceId
            });
            InCallManager.stopRingtone();
            notifee.cancelNotification(callId.toString());
            InCallManager.start({ media: 'video' });
            //  TODO: add back to foreground for app
            router.push({
                pathname: '/video-call', 
                params: { 
                    contactId: contact ? contact.id : undefined, 
                    userId: !contact ? user?.id : undefined 
                } 
            });
        }
    }
});
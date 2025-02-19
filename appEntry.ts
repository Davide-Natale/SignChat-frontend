import 'expo-router/entry';
import { messaging } from './utils/firebaseMessaging';
import { showIncomingCall } from './utils/callKeep';
import { setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayNotification } from './utils/notifications';

setBackgroundMessageHandler(messaging, async message => {
    if (message.data?.notifee) {
        await displayNotification(typeof message.data.notifee === 'string' ?
            JSON.parse(message.data.notifee) :
            message.data.notifee
        );
    } else if(message.data?.type === 'incoming-call') {
        showIncomingCall('2', '1234', 'Lorenzo Lenti');
    }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
    if(type === EventType.PRESS) {
        //  TODO: you might want to redirect user to correct route
        console.log("Backgroud notification pressed");
        console.log(JSON.stringify(detail.notification));
    }
});
import 'expo-router/entry';
import { messaging } from './utils/firebaseMessaging';
import { showIncomingCall } from './utils/callKeep';
import { setBackgroundMessageHandler } from '@react-native-firebase/messaging';

setBackgroundMessageHandler(messaging, async message => {
    if (message.data?.type === 'incoming-call') {
        showIncomingCall('2', '1234', 'Lorenzo Lenti');
    }
});
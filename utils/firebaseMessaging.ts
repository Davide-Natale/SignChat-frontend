import { getMessaging, getToken } from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';

export const messaging = getMessaging();

export const registerForPushNotificationsAsync = async (): Promise<string> => {
    if(Device.isDevice) {
        if(Platform.OS === 'android' && Platform.Version >= 33) {
            let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            let finalGranted = granted;

            if(!granted) {
                const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                finalGranted = status === PermissionsAndroid.RESULTS.GRANTED;
            }

            if(!finalGranted) {
                throw new Error('Permission not granted to use push notifications.');
            }
        }

        const fcmToken = await getToken(messaging);
    
        return fcmToken;
    }

    throw new Error('Must use physical device for push notifications.');
};
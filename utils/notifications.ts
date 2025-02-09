import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export const registerForPushNotificationsAsync = async (): Promise<string> => {
    if(Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if(existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if(finalStatus !== 'granted') {
            throw new Error('Permission not granted to use push notifications.');
        }

        const projectId = Constants.expoConfig?.extra?.eas.projectId;

        if(!projectId) {
            throw new Error('Project ID not found.');
        }

        try {
            const expoToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            return expoToken;
        } catch (error) {
            throw error;
        }
    } else {
        throw new Error('Must use physical device for push notifications.');
    }
};
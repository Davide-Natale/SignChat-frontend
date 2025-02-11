import RNCallKeep from 'react-native-callkeep';
import { PermissionsAndroid, Platform } from 'react-native';

const callKeepOptions = {
    ios: {
        appName: 'SignChat',
    },
    android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs permissions to manage calls.',
        cancelButton: 'Cancel',
        okButton: 'Allow',
        additionalPermissions: []
    }
};

const requestReadPhoneNumbersPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
                {
                    title: 'Access to Phone Numbers',
                    message: 'The app needs access to phone numbers to function properly.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'Allow',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.warn(error);
            return false;
        }
    }
    return true;
}

export const setupCallKeep = async () => {
    //const granted = await requestReadPhoneNumbersPermission();

    //if(granted) {
        RNCallKeep.setup(callKeepOptions);
        RNCallKeep.setAvailable(true);
    //}
}

export const showIncomingCall = (callerId: string, callerNumber:string, callerName?: string) => {
    RNCallKeep.displayIncomingCall(callerId, callerNumber, callerName);
};
import RNCallKeep from 'react-native-callkeep';

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

export const setupCallKeep = async () => {
    await RNCallKeep.setup(callKeepOptions);
    RNCallKeep.setAvailable(true);  
}

export const showIncomingCall = (callerId: string, callerNumber:string, callerName?: string) => {
    RNCallKeep.displayIncomingCall(callerId, callerNumber, callerName);
};
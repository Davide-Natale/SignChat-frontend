import notifee, { AndroidImportance } from '@notifee/react-native';

interface MessagePayload {
    title: string,
    body: string,
    data?: { [key: string]: string | number | object; }
}

export const displayNotification = async (messagePayload: MessagePayload) => {
    const { title, body, data } = messagePayload;

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
            pressAction: {
                id: 'default'
            }
        }
    });
};

export const checkInitialNotification = async () => {
    const initialNotification = await notifee.getInitialNotification();

    if(initialNotification) {
        //  TODO: you might want to redirect user to correct route
        console.log("Initial Notification");
        console.log(JSON.stringify(initialNotification.notification));
    }
};
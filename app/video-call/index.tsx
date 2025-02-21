import contactsAPI from '@/api/contactsAPI';
import usersAPI from '@/api/usersAPI';
import { ErrorContext } from '@/contexts/ErrorContext';
import { VideoCallContext } from '@/contexts/VideoCallContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import InCallManager from 'react-native-incall-manager';

export default function VideoCall() {
    const router = useRouter();
    const errorContext = useContext(ErrorContext);
    const videoCallContext = useContext(VideoCallContext);
    const { callerId, isContact } = useLocalSearchParams<{ callerId: string, isContact: string }>();

    useEffect(() => {
        const fetchCaller = async () => {
            try {
                const callerData =  isContact === 'true' ?
                    await contactsAPI.getContact(parseInt(callerId)) :
                    await usersAPI.getUser(parseInt(callerId));

                videoCallContext?.updateCaller(callerData);
            } catch (error) {
                //  TODO: add SnackBar in this page
                errorContext?.handleError(error);
            }
        };
        
        fetchCaller();
    }, []);

    useEffect(() => { console.log(videoCallContext?.caller); }, [videoCallContext?.caller]);

    return (
        <View style={styles.main}>
            <Button title='Incoming' onPress={() => router.push("/video-call/incoming")} />
            <Button title='Start Rington' onPress={() => InCallManager.startRingtone('_DEFAULT_', [1000, 2000], 'PlayAndRecord', 30)} />
            <Button title='Stop Rington' onPress={() => InCallManager.stopRingtone()} />
            <Button title='Stop RingBack' onPress={() => InCallManager.stopRingback()} />
            <Button title='Stop Call' onPress={() => videoCallContext?.endCall()} />
        </View>
    );
}

const styles = StyleSheet.create({
    main: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' , 
        backgroundColor: 'black'
    }
});
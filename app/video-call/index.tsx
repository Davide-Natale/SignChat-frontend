import contactsAPI from '@/api/contactsAPI';
import usersAPI from '@/api/usersAPI';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import { ErrorContext } from '@/contexts/ErrorContext';
import { VideoCallContext } from '@/contexts/VideoCallContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';

export default function VideoCall() {
    const router = useRouter();
    const errorContext = useContext(ErrorContext);
    const videoCallContext = useContext(VideoCallContext);
    const { contactId, userId } = useLocalSearchParams<{ contactId: string, userId: string }>();

    useEffect(() => {
        const fetchOtherUser = async () => {
            try {
                errorContext?.clearErrMsg();
                const otherUser = contactId ?
                    await contactsAPI.getContact(parseInt(contactId)) :
                    await usersAPI.getUser(parseInt(userId));

                videoCallContext?.updateOtherUser(otherUser);
            } catch (error) {
                errorContext?.handleError(error);
            }
        };
        
        fetchOtherUser();
    }, []);

    return (
        <View style={styles.main}>
            <Button title='Incoming' onPress={() => router.push("/video-call/incoming")} />
            <Button title='Stop Call' onPress={() => videoCallContext?.endCall()} />
            <ThemedSnackBar />
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
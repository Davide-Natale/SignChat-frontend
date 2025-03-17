import contactsAPI from '@/api/contactsAPI';
import usersAPI from '@/api/usersAPI';
import ImageProfile from '@/components/ImageProfile';
import ThemedButton from '@/components/ThemedButton';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import ThemedText from '@/components/ThemedText';
import { ErrorContext } from '@/contexts/ErrorContext';
import { isContact, VideoCallContext } from '@/contexts/VideoCallContext';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CallBoldIcon from '@/assets/icons/call-bold.svg';
import EndCallBoldIcon from '@/assets/icons/endCall-bold.svg';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export default function IncomingVideoCall() {
    const theme = useTheme();
    const errorContext = useContext(ErrorContext);
    const videoCallContext = useContext(VideoCallContext);
    const insets = useSafeAreaInsets();
    const { callId, contactId, userId } = useLocalSearchParams<{ callId: string, contactId: string, userId: string }>();
    const shake = useSharedValue(0);
    const callerUserId = useMemo(() => videoCallContext?.otherUser && isContact(videoCallContext.otherUser) ?
        videoCallContext.otherUser.user?.id : 
        videoCallContext?.otherUser && !isContact(videoCallContext.otherUser) ?
            videoCallContext.otherUser.id : undefined, [videoCallContext?.otherUser]);
    const contactName = useMemo(() => videoCallContext?.otherUser && isContact(videoCallContext.otherUser) ?
        `${videoCallContext.otherUser.firstName} ${videoCallContext.otherUser.lastName || ''}`.trim() : "", [videoCallContext?.otherUser]);
    const userName = useMemo(() => videoCallContext?.otherUser && !isContact(videoCallContext.otherUser) ?
        `~${videoCallContext.otherUser.firstName} ${videoCallContext.otherUser.lastName}` : "", [videoCallContext?.otherUser]);
    const imageProfile = useMemo(() => videoCallContext?.otherUser && isContact(videoCallContext.otherUser) ?
        videoCallContext.otherUser.user?.imageProfile :
        videoCallContext?.otherUser && !isContact(videoCallContext.otherUser) ?
            videoCallContext.otherUser.imageProfile : null, [videoCallContext?.otherUser]);

    const acceptButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shake.value }]
    }));
 
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

    useEffect(() => {
        shake.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 80 }),
                withTiming(5, { duration: 80 }),
                withTiming(-5, { duration: 80 }),
                withTiming(5, { duration: 80 }),
                withTiming(0, { duration: 80 }),
                withDelay(1000, withTiming(0, { duration: 0 })) 
            ),
            -1
        );
    }, []);

    return (
        <View style={[styles.main, { backgroundColor: theme.backgroundBlue }]}>
            <StatusBar style='auto' />
            <View style={styles.inner} >
                <View style={[styles.textGroup, { top: insets.top + 45 }]} >
                    <ThemedText color={theme.primaryText} fontSize={25} fontWeight='semibold' numberOfLines={1}>
                        {contactName || videoCallContext?.otherUser?.phone}
                    </ThemedText>
                    <ThemedText color={theme.secondaryText} fontSize={20} fontWeight='regular' numberOfLines={1}>
                        {userName || videoCallContext?.otherUser?.phone}
                    </ThemedText>
                </View>
                <ImageProfile
                    uri={imageProfile ?? null}
                    size={200}
                />
                <View style={styles.buttonRow} >
                    <View style={styles.buttonGroup} >
                        <ThemedButton
                            onPress={() => { 
                                cancelAnimation(shake);
                                videoCallContext?.rejectCall(parseInt(callId), callerUserId ?? -1, true);
                            }}
                            height={65}
                            width={65}
                            shape='circular'
                            backgroundColor={theme.error}
                        >
                            <EndCallBoldIcon height={28} width={28} fill={theme.onAccent} />
                        </ThemedButton>
                        <ThemedText 
                            color={theme.secondaryText} 
                            fontSize={16} 
                            fontWeight='regular' 
                            numberOfLines={1}
                            style={styles.label}
                        >
                            Decline
                        </ThemedText>
                    </View>
                    <View style={styles.buttonGroup} >
                        <Animated.View style={acceptButtonAnimatedStyle} >
                            <ThemedButton
                                onPress={() => { 
                                    cancelAnimation(shake);
                                    if(videoCallContext?.otherUser && callerUserId) {
                                        videoCallContext?.answerCall(
                                            parseInt(callId),
                                            callerUserId,
                                            contactId ? parseInt(contactId) : undefined,
                                            'replace'
                                        );
                                    }
                                }}
                                height={65}
                                width={65}
                                shape='circular'
                                backgroundColor={theme.confirm}
                            >
                                <CallBoldIcon height={28} width={28} fill={theme.onAccent} />
                            </ThemedButton>
                        </Animated.View>
                        <ThemedText 
                            color={theme.secondaryText} 
                            fontSize={16} 
                            fontWeight='regular' 
                            numberOfLines={1}
                            style={styles.label}
                        >
                            Accept
                        </ThemedText>
                    </View>
                </View>
            </View>
            <ThemedSnackBar />
        </View>  
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    inner: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    textGroup: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute'
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 65
    },
    buttonGroup: { 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    label: { 
        marginTop: 10 
    }
});
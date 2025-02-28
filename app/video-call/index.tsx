import contactsAPI from '@/api/contactsAPI';
import usersAPI from '@/api/usersAPI';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import { ErrorContext } from '@/contexts/ErrorContext';
import { isContact, VideoCallContext } from '@/contexts/VideoCallContext';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import MoreIcon from '@/assets/icons/more.svg';
import MicOffBoldIcon from '@/assets/icons/micOff-bold.svg';
import VideoCallBoldIcon from '@/assets/icons/videoCall-bold.svg';
import EndCallBoldIcon from '@/assets/icons/endCall-bold.svg';
import CameraRotateBoldIcon from '@/assets/icons/cameraRotate-bold.svg';
import ClearIcon from '@/assets/icons/clear.svg';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import ThemedButton from '@/components/ThemedButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from '@/components/ThemedText';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import ImageProfile from '@/components/ImageProfile';
import { AuthContext } from '@/contexts/AuthContext';

//  Use duration plugin
dayjs.extend(duration);

const CAMERA_SIZE = {
    withControls: {
        height: 240,
        width: 160
    },
    withoutControls: {
        height: 145,
        width: 85
    }
}

export default function VideoCall() {
    const darkTheme = useTheme('dark');
    const lightTheme = useTheme('light');
    const insets = useSafeAreaInsets();
    const authContext = useContext(AuthContext);
    const errorContext = useContext(ErrorContext);
    const videoCallContext = useContext(VideoCallContext);
    const isVisible = useSharedValue(1);
    const width = useSharedValue(CAMERA_SIZE.withControls.width);
    const height = useSharedValue(CAMERA_SIZE.withControls.height);
    const size = useSharedValue(CAMERA_SIZE.withControls.width / 2);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const { contactId, userId } = useLocalSearchParams<{ contactId: string, userId: string }>();
    const formattedDuration = useMemo(() => dayjs.duration(videoCallContext?.duration ?? 0, 'seconds').format('mm:ss'), [videoCallContext?.duration]);
    const contactName = useMemo(() => videoCallContext?.otherUser && isContact(videoCallContext.otherUser) ?
        `${videoCallContext.otherUser.firstName} ${videoCallContext.otherUser.lastName || ''}`.trim() : "", [videoCallContext?.otherUser]);
    const userName = useMemo(() => videoCallContext?.otherUser && !isContact(videoCallContext.otherUser) ?
        `~${videoCallContext.otherUser.firstName} ${videoCallContext.otherUser.lastName}` : "", [videoCallContext?.otherUser]);
    const imageProfile = useMemo(() => videoCallContext?.otherUser && isContact(videoCallContext.otherUser) ?
        videoCallContext.otherUser.user?.imageProfile :
        videoCallContext?.otherUser && !isContact(videoCallContext.otherUser) ?
            videoCallContext.otherUser.imageProfile : null, [videoCallContext?.otherUser]);
    const placeholder = useMemo(() => require("@/assets/images/profile-placeholder-dark.png"), []);
    const controls = useMemo(() => [
        {
            backgroundColor: lightTheme.secondaryText,
            onPress: () => { if(videoCallContext?.isCallStarted) startTimer() ; console.log('More Options'); },
            icon: <MoreIcon height={60} width={60} stroke={lightTheme.primary} /> 
        },
        {
            backgroundColor: videoCallContext?.isCameraOff ? lightTheme.secondaryText : lightTheme.secondary,
            onPress: () => { if(videoCallContext?.isCallStarted) startTimer() ; videoCallContext?.toggleIsCameraOff(); },
            icon: <VideoCallBoldIcon height={28} width={28} fill={videoCallContext?.isCameraOff ? lightTheme.primary : lightTheme.primaryText} />
        },
        {
            backgroundColor: videoCallContext?.isMicMuted ? lightTheme.secondary : lightTheme.secondaryText,
            onPress: () => { if(videoCallContext?.isCallStarted) startTimer() ; videoCallContext?.toggleIsMicMuted(); },
            icon: <MicOffBoldIcon height={28} width={28} fill={videoCallContext?.isMicMuted ? darkTheme.error : lightTheme.primary} />
        },
        {
            backgroundColor: darkTheme.error,
            onPress: () => { if(videoCallContext?.isCallStarted) startTimer() ; console.log('End Call'); },
            icon: <EndCallBoldIcon height={28} width={28} fill={lightTheme.primary} />
        }
    ], [videoCallContext?.isCallStarted, videoCallContext?.isCameraOff, videoCallContext?.isMicMuted]);

    const startTimer = useCallback(() => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            runOnJS(hideControls)();
        }, 2000);
    }, []);

    const clearTimer = useCallback(() => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    const hideControls = useCallback(() => {
        clearTimer();
        isVisible.value = 0; 
        width.value = CAMERA_SIZE.withoutControls.width;
        height.value = CAMERA_SIZE.withoutControls.height;
        size.value = CAMERA_SIZE.withoutControls.width / 2
    }, []);

    const toggleVisibility = useCallback(() => {
        if(isVisible.value === 1) {
            hideControls();
            return;
        }

        isVisible.value = 1;
        width.value = CAMERA_SIZE.withControls.width;
        height.value = CAMERA_SIZE.withControls.height;
        size.value = CAMERA_SIZE.withControls.width / 2;
        startTimer();
    }, []); 

    const tapGesture = Gesture.Tap()
        .enabled(videoCallContext?.isCallStarted ?? false)
        .onEnd(() => {
            runOnJS(toggleVisibility)();
        });

    const textGroupAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(isVisible.value ? 0 : -100, { duration: 300 }) }],
        opacity: withTiming(isVisible.value, { duration: 300 })
    }));

    const controlBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(isVisible.value ? 0 : 100, { duration: 300 }) }],
        opacity: withTiming(isVisible.value, { duration: 300 })
    }));

    const cameraAnimatedStyle = useAnimatedStyle(() => {
        const borderRadius = width.value / 10;

        return {
            width: withTiming(width.value, { duration: 300 }),
            height: withTiming(height.value, { duration: 300 }),
            borderRadius: withTiming(borderRadius, { duration: 300 }),
            transform: [{ translateY: withTiming(isVisible.value ? -110 : 0, { duration: 300 }) }]
        }
    });

    const cameraRotateButtonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isVisible.value, { duration: 300 })
    }));

    const micOffIconAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isVisible.value ? 0 : 1, { duration: 300 })
    }));

    const imageProfileAnimatedStyle = useAnimatedStyle(() => {
        const borderRadius = size.value / 2;

        return {
            width: withTiming(size.value, { duration: 300 }),
            height: withTiming(size.value, { duration: 300 }),
            borderRadius: withTiming(borderRadius, { duration: 300 })
        }
    });

    useEffect(() => {
        if(videoCallContext?.isCallStarted) {
            startTimer();
            return () => { clearTimer(); };
        }
    }, [videoCallContext?.isCallStarted]);

    useEffect(() => {
        const fetchOtherUser = async () => {
            try {
                if(!videoCallContext?.otherUser) {
                    errorContext?.clearErrMsg();
                    const otherUser = contactId ?
                        await contactsAPI.getContact(parseInt(contactId)) :
                        await usersAPI.getUser(parseInt(userId));
                    videoCallContext?.updateOtherUser(otherUser);
                }
            } catch (error) {
                errorContext?.handleError(error);
            }
        };
        
        fetchOtherUser();
    }, []);

    return (
        <View style={[styles.main, { backgroundColor: darkTheme.primary }]} >
            <StatusBar style='light' />
            { !videoCallContext?.endCallStatus ?
                <>
                    <GestureDetector gesture={tapGesture} >
                        <View style={styles.inner} >
                            <ImageProfile
                                uri={imageProfile ?? null}
                                size={200}
                            />
                        </View>
                    </GestureDetector>
                    <Animated.View style={[styles.textGroup, textGroupAnimatedStyle, { top: insets.top + 20 }]}>
                        <ThemedText color={darkTheme.primaryText} fontSize={20} fontWeight='semibold' numberOfLines={1}>
                            {contactName || videoCallContext?.otherUser?.phone}
                        </ThemedText>
                        {userName ?
                            <ThemedText color={darkTheme.primaryText} fontSize={14} fontWeight='medium' numberOfLines={1}>
                                {userName}
                            </ThemedText> : null
                        }
                        <ThemedText color={darkTheme.primaryText} fontSize={14} fontWeight='regular' numberOfLines={1}>
                            {
                                videoCallContext?.isRinging ? "Ringing..." :
                                    videoCallContext?.isCallStarted ? formattedDuration :
                                        "Video call in progress"
                            }
                        </ThemedText>
                    </Animated.View>
                    <Animated.View style={[styles.controlBar, controlBarAnimatedStyle, { backgroundColor: darkTheme.secondary }]} >
                        {controls.map((control, index) => (
                            <ThemedButton
                                key={index}
                                onPress={control.onPress}
                                height={55}
                                width={55}
                                shape='circular'
                                backgroundColor={control.backgroundColor}
                            >
                                {control.icon}
                            </ThemedButton>
                        ))
                        }
                    </Animated.View>
                    <Animated.View style={[styles.camera, cameraAnimatedStyle, { backgroundColor: darkTheme.secondary }]} >
                        {!videoCallContext?.isCameraOff ?
                            <Animated.View style={[styles.cameraRotateButton, cameraRotateButtonAnimatedStyle]}>
                                <ThemedButton
                                    onPress={() => { if(videoCallContext?.isCallStarted) startTimer(); console.log('Camera Rotated') }}
                                    height={40}
                                    width={40}
                                    shape='circular'
                                    backgroundColor={lightTheme.secondaryText}
                                >
                                    <CameraRotateBoldIcon fill={lightTheme.primary} />
                                </ThemedButton>
                            </Animated.View> :
                            <Animated.Image
                                source={authContext?.user?.imageProfile ? { uri: authContext?.user?.imageProfile } : placeholder}
                                style={imageProfileAnimatedStyle}
                            />
                        }
                        {videoCallContext?.isMicMuted ?
                            <Animated.View style={[styles.micOffIcon, micOffIconAnimatedStyle]} >
                                <MicOffBoldIcon height={18} width={18} fill={darkTheme.primaryText} />
                            </Animated.View> : null
                        }
                    </Animated.View>
                </> :
                <View style={styles.inner} > 
                    <View style={[styles.container, { top: insets.top + 70 }]} >
                        <ImageProfile
                            uri={imageProfile ?? null}
                            size={140}
                        />
                        <ThemedText 
                            color={darkTheme.primaryText} 
                            fontSize={27} 
                            fontWeight='semibold' 
                            numberOfLines={1} 
                            style={styles.name}
                        >
                            {contactName || videoCallContext?.otherUser?.phone}
                        </ThemedText>
                        {!userName ?
                            <ThemedText color={darkTheme.primaryText} fontSize={16} fontWeight='medium' numberOfLines={1}>
                                {userName}
                            </ThemedText> : null
                        }
                        <ThemedText 
                            color={darkTheme.secondaryText} 
                            fontSize={20} 
                            fontWeight='regular' 
                            numberOfLines={1} 
                            style={styles.message}
                        >
                            No response
                        </ThemedText>
                    </View>
                    <View style={styles.buttonRow} >
                        <View style={styles.buttonGroup} >
                            <ThemedButton
                                onPress={() => {}}
                                height={65}
                                width={65}
                                shape='circular'
                                backgroundColor={lightTheme.secondary}
                            >
                                <ClearIcon height={28} width={28} stroke={lightTheme.primaryText} />
                            </ThemedButton>
                            <ThemedText
                                color={darkTheme.secondaryText}
                                fontSize={16}
                                fontWeight='regular'
                                numberOfLines={1}
                                style={styles.label}
                            >
                                Cancel
                            </ThemedText>
                        </View>
                        { videoCallContext.endCallStatus === 'unanswered' ?
                            <View style={styles.buttonGroup} >
                                <ThemedButton
                                    onPress={() => { }}
                                    height={65}
                                    width={65}
                                    shape='circular'
                                    backgroundColor={darkTheme.confirm}
                                >
                                    <VideoCallBoldIcon height={28} width={28} fill={darkTheme.onAccent} />
                                </ThemedButton>
                                <ThemedText
                                    color={darkTheme.secondaryText}
                                    fontSize={16}
                                    fontWeight='regular'
                                    numberOfLines={1}
                                    style={styles.label}
                                >
                                    Retry
                                </ThemedText>
                            </View> : null
                        }
                    </View>
                </View>
            }
            <ThemedSnackBar />
        </View>
    );
}

const styles = StyleSheet.create({
    main: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    inner: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textGroup: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute'
    },
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: "90%",
        height: 80,
        borderRadius: 80 / 3,
        position: 'absolute',
        bottom: 30
    },
    camera: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        right: '5%'
    },
    micOffIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', 
        top: 8, 
        left: 8 
    },
    cameraRotateButton: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 8,
        right: 8
    },
    container: {
        justifyContent: 'center', 
        alignItems: 'center', 
        position: 'absolute'
    },
    name: { 
        marginTop: 10
    },
    message: {
        margin: 6
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
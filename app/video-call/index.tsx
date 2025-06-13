import contactsAPI from '@/api/contactsAPI';
import usersAPI from '@/api/usersAPI';
import ThemedSnackBar from '@/components/ThemedSnackBar';
import { ErrorContext } from '@/contexts/ErrorContext';
import { isContact, VideoCallContext } from '@/contexts/VideoCallContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MoreIcon from '@/assets/icons/more.svg';
import MicOffBoldIcon from '@/assets/icons/micOff-bold.svg';
import VideoCallBoldIcon from '@/assets/icons/videoCall-bold.svg';
import EndCallBoldIcon from '@/assets/icons/endCall-bold.svg';
import CameraRotateBoldIcon from '@/assets/icons/cameraRotate-bold.svg';
import ClearIcon from '@/assets/icons/clear.svg';
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from 'react-native'; 
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
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import VideoCallBottomSheet from '@/components/VideoCallBottomSheet';
import { RTCView } from "react-native-webrtc";
import SignalIndicator from '@/components/SignalIndicator';
import { AppContext } from '@/contexts/AppContext';

//  Use duration plugin
dayjs.extend(duration);

type Corner = { x: number, y: number };
type CornerId = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

const ACCESSIBILITY_SIZE = {
    height: 200,
    width: 112.5
}

const CAMERA_SIZE = {
    withControls: {
        height: 240,
        width: 135
    },
    withoutControls: {
        height: 144,
        width: 81
    }
}

export default function VideoCall() {
    const router = useRouter();
    const darkTheme = useTheme('dark');
    const lightTheme = useTheme('light');
    const insets = useSafeAreaInsets();
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const errorContext = useContext(ErrorContext);
    const videoCallContext = useContext(VideoCallContext);
    const screenHeight = Dimensions.get('screen').height;
    const screenWidth = Dimensions.get('screen').width;
    const marginX = screenWidth * 0.05;
    const marginYTop = screenHeight * 0.01;
    const marginYBottom = screenHeight * 0.04;
    const isVisible = useSharedValue(1);
    const isDragging = useSharedValue(0);
    const cornerId = useSharedValue<CornerId>('bottomRight');
    const width = useSharedValue(CAMERA_SIZE.withControls.width);
    const height = useSharedValue(CAMERA_SIZE.withControls.height);
    const size = useSharedValue(CAMERA_SIZE.withControls.width / 2);
    const accessibilityTranslateY = useSharedValue(screenHeight - ACCESSIBILITY_SIZE.height - 110 - marginYBottom);
    const translateX = useSharedValue(screenWidth - CAMERA_SIZE.withControls.width - marginX);
    const translateY = useSharedValue(screenHeight - CAMERA_SIZE.withControls.height - 110 - marginYBottom);
    const context = useSharedValue({ x: 0, y: 0 });
    const timeoutRef = useRef<NodeJS.Timeout>();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [controlBarHeight, setControlBarHeight] = useState(0);
    const [textGroupHeight, setTextGroupHeight] = useState(0);
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
            onPress: () => { clearTimer() ; bottomSheetRef.current?.present() },
            icon: <MoreIcon height={60} width={60} stroke={lightTheme.primary} /> 
        },
        {
            backgroundColor: !videoCallContext?.remoteStream || videoCallContext?.isCameraOff ? lightTheme.secondaryText : lightTheme.secondary,
            onPress: () => { if(videoCallContext?.isCallStarted) startTimer() ; videoCallContext?.toggleIsCameraOff() },
            disabled: !videoCallContext?.remoteStream,
            icon: (
                <VideoCallBoldIcon 
                    height={28} 
                    width={28} 
                    fill={  
                        !videoCallContext?.remoteStream ? darkTheme.secondaryText : 
                            videoCallContext?.isCameraOff ? lightTheme.primary :
                                lightTheme.primaryText
                    } 
                />
            )
        },
        {
            backgroundColor: !videoCallContext?.remoteStream || !videoCallContext?.isMicMuted ? lightTheme.secondaryText : lightTheme.secondary,
            onPress: () => { if(videoCallContext?.isCallStarted) startTimer() ; videoCallContext?.toggleIsMicMuted() },
            disabled: !videoCallContext?.remoteStream,
            icon: (
                <MicOffBoldIcon 
                    height={28} 
                    width={28} 
                    fill={
                        !videoCallContext?.remoteStream ? darkTheme.secondaryText :
                            videoCallContext?.isMicMuted ? darkTheme.error : 
                                lightTheme.primary
                    } 
                />
            )
        },
        {
            backgroundColor: darkTheme.error,
            onPress: () => { clearTimer() ; videoCallContext?.endCall() },
            icon: <EndCallBoldIcon height={28} width={28} fill={lightTheme.primary} />
        }
    ], [
        videoCallContext?.otherUser, 
        videoCallContext?.isCallStarted, 
        videoCallContext?.isCameraOff, 
        videoCallContext?.isMicMuted, 
        videoCallContext?.remoteStream
    ]);

    const onControlBarLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setControlBarHeight(height + 30);
    }, []);
    
    const onTextGroupLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setTextGroupHeight(height + 22);
    }, []);

    const startTimer = useCallback(() => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            runOnJS(hideControls)();
        }, 3000);
    }, [textGroupHeight, controlBarHeight]);

    const clearTimer = useCallback(() => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    const hideControls = useCallback(() => {
        clearTimer();
        isVisible.value = 0;

        if(!isDragging.value) {
            if(cornerId.value !== 'topLeft' && cornerId.value !== 'topRight') {
                translateY.value += CAMERA_SIZE.withControls.height - CAMERA_SIZE.withoutControls.height + controlBarHeight;
            } else {
                translateY.value -= textGroupHeight;
            }

            if(cornerId.value !== 'topLeft' && cornerId.value !== 'bottomLeft') {
                translateX.value = screenWidth - CAMERA_SIZE.withoutControls.width - marginX;
            }
        }

        width.value = CAMERA_SIZE.withoutControls.width;
        height.value = CAMERA_SIZE.withoutControls.height;
        size.value = CAMERA_SIZE.withoutControls.width / 2;
        accessibilityTranslateY.value += controlBarHeight;  
    }, [controlBarHeight, textGroupHeight]);

    const toggleVisibility = useCallback(() => {
        if(isVisible.value === 1) {
            hideControls();
            return;
        }

        isVisible.value = 1;

        if(cornerId.value !== 'topLeft' && cornerId.value !== 'topRight') {
            translateY.value += CAMERA_SIZE.withoutControls.height - CAMERA_SIZE.withControls.height - controlBarHeight;
        } else {
            translateY.value += textGroupHeight;
        }

        if(cornerId.value !== 'topLeft' && cornerId.value !== 'bottomLeft') {
            translateX.value = screenWidth - CAMERA_SIZE.withControls.width - marginX;
        }

        width.value = CAMERA_SIZE.withControls.width;
        height.value = CAMERA_SIZE.withControls.height;
        size.value = CAMERA_SIZE.withControls.width / 2;
        accessibilityTranslateY.value -= controlBarHeight;
        startTimer();   
    }, [controlBarHeight, textGroupHeight]);

    const tapGesture = Gesture.Tap()
        .enabled(videoCallContext?.isCallStarted ?? false)
        .onEnd(() => {
            runOnJS(toggleVisibility)();
        });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            isDragging.value = 1;
            context.value = { x: translateX.value, y: translateY.value };
        })
        .onUpdate(event => {
            translateX.value = event.translationX + context.value.x; 
            translateY.value = event.translationY + context.value.y;
        })
        .onEnd((event) => {
            const leftX = marginX;
            const rightX = screenWidth - width.value - marginX;
            const topY = isVisible.value ? insets.top + textGroupHeight + marginYTop : insets.top + marginYTop;
            const bottomY = isVisible.value ? screenHeight - height.value - marginYBottom - controlBarHeight :
                screenHeight - height.value - marginYBottom;

            const corners: Record<CornerId, Corner> = {
                topLeft: { x: leftX, y: topY },
                topRight: { x: rightX, y: topY },
                bottomLeft: { x: leftX, y: bottomY },
                bottomRight: { x: rightX, y: bottomY }
            };

            let closestCornerId: CornerId | undefined = undefined;
            const velocityThreshold = 1000; 
            const velocityX = event.velocityX;
            const velocityY = event.velocityY;
            const velocity = Math.hypot(velocityX, velocityY);

            if(velocity > velocityThreshold) {
                const fromCorner = cornerId.value;
                let angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
                if(angle < 0) angle += 360;

                if((angle >= 0 && angle <= 15) || angle >= 345) {
                    closestCornerId = fromCorner === 'topLeft' ? 'topRight' :
                        fromCorner === 'bottomLeft' ? 'bottomRight' : undefined;
                } else if(angle >= 75 && angle <= 105) {
                    closestCornerId = fromCorner === 'topLeft' ? 'bottomLeft' :
                        fromCorner === 'topRight' ? 'bottomRight' : undefined;
                } else if(angle >= 165 && angle <= 195) {
                    closestCornerId = fromCorner === 'topRight' ? 'topLeft' :
                        fromCorner === 'bottomRight' ? 'bottomLeft' : undefined;
                } else if(angle >= 255 && angle <= 285) {
                    closestCornerId = fromCorner === 'bottomLeft' ? 'topLeft' :
                        fromCorner === 'bottomRight' ? 'topRight' : undefined;
                } else if(fromCorner === 'topLeft' && angle > 15 && angle < 75) {
                    closestCornerId = 'bottomRight';
                } else if(fromCorner === 'topRight' && angle > 105 && angle < 165) {
                    closestCornerId = 'bottomLeft';
                } else if(fromCorner === 'bottomRight' && angle > 195 && angle < 255) {
                    closestCornerId = 'topLeft';
                } else if(fromCorner === 'bottomLeft' && angle > 285 && angle < 345) {
                    closestCornerId = 'topRight';
                }
            } 
            
            if(!closestCornerId) {
                let minDistance = Infinity;
                closestCornerId = 'bottomRight';
                
                for (const [key, corner] of Object.entries(corners)) {
                    const dist = Math.hypot(corner.x - translateX.value, corner.y - translateY.value);
    
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestCornerId = key as CornerId;
                    }
                }
            }

            const closestCorner = corners[closestCornerId];
            isDragging.value = 0;
            cornerId.value = closestCornerId;
            translateX.value = closestCorner.x;
            translateY.value = closestCorner.y;
        });

    const cameraTapGesture = Gesture.Tap()
    .onEnd(() => {
        if(!isVisible.value) {
            runOnJS(toggleVisibility)();
        }
    });

    const textGroupAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(isVisible.value ? 0 : -100, { duration: 300 }) }],
        opacity: withTiming(isVisible.value, { duration: 300 })
    }));

    const controlBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(isVisible.value ? 0 : 100, { duration: 300 }) }],
        opacity: withTiming(isVisible.value, { duration: 300 })
    }));

    const accessibilityAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(accessibilityTranslateY.value, { duration: 300 }) }]
    }));

    const cameraAnimatedStyle = useAnimatedStyle(() => {
        const borderRadius = width.value / 10;

        return {
            width: withTiming(width.value, { duration: 300 }),
            height: withTiming(height.value, { duration: 300 }),
            borderRadius: withTiming(borderRadius, { duration: 300 }),
            transform: [
                { translateY: isDragging.value ? translateY.value : withTiming(translateY.value, { duration: 300 }) },
                { translateX: isDragging.value ? translateX.value : withTiming(translateX.value, { duration: 300 }) }
            ]
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
                            { videoCallContext?.isCallStarted && videoCallContext.remoteStream && !videoCallContext.otherUserStatus.videoPaused? 
                                <RTCView streamURL={videoCallContext.remoteStream.toURL()} objectFit='cover' style={styles.stream} /> :
                                <>
                                    <ImageProfile
                                        uri={imageProfile ?? null}
                                        size={200}
                                        style={styles.imageProfile}
                                    />
                                    { videoCallContext?.otherUserStatus.muted && videoCallContext.otherUserStatus.videoPaused ?
                                        <View style={[styles.mutedGroup, { backgroundColor: lightTheme.secondaryText }]} >
                                            <MicOffBoldIcon
                                                height={20}
                                                width={20}
                                                fill={darkTheme.primaryText}
                                            />
                                            <ThemedText 
                                                color={darkTheme.primaryText} 
                                                fontSize={16} 
                                                fontWeight='medium' 
                                                numberOfLines={1} 
                                                style={styles.mutedText}
                                            >
                                                Muted
                                            </ThemedText>
                                        </View> : null
                                    }
                                </>
                            }
                            { videoCallContext?.otherUserStatus.muted && !videoCallContext.otherUserStatus.videoPaused ?
                                <MicOffBoldIcon
                                    height={22}
                                    width={22}
                                    fill={darkTheme.error}
                                    style={[styles.mutedIcon, { top: insets.top + 4 }]}
                                /> : null
                            }
                            { videoCallContext?.connectionQuality === 'Low' ? 
                                <SignalIndicator
                                    height={16}
                                    connectionQuality={videoCallContext.connectionQuality}
                                    style={[styles.indicator, { top: insets.top + 4 }]}
                                /> : null
                            }
                        </View>
                    </GestureDetector>
                    <Animated.View
                        onLayout={onTextGroupLayout}
                        style={[styles.textGroup, textGroupAnimatedStyle, { top: insets.top + 20 }]}
                    >
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
                    <Animated.View
                        onLayout={onControlBarLayout}
                        style={[styles.controlBar, controlBarAnimatedStyle, { backgroundColor: darkTheme.secondary }]} 
                    >
                        {controls.map((control, index) => (
                            <ThemedButton
                                key={index}
                                onPress={control.onPress}
                                height={55}
                                width={55}
                                shape='circular'
                                disabled={control.disabled}
                                backgroundColor={control.backgroundColor}
                            >
                                {control.icon}
                            </ThemedButton>
                        ))
                        }
                    </Animated.View>
                    { appContext?.isAccessibilityEnabled && videoCallContext?.isAccessibilityCall ? 
                        <Animated.View style={[styles.camera, accessibilityAnimatedStyle, 
                            { 
                                left: marginX,
                                height: ACCESSIBILITY_SIZE.height,
                                width: ACCESSIBILITY_SIZE.width,
                                borderRadius: ACCESSIBILITY_SIZE.width / 10,
                                backgroundColor: darkTheme.secondary 
                            }
                        ]}>
                            <RTCView 
                                streamURL={videoCallContext.accessibilityRemoteStream?.toURL()} 
                                zOrder={1} 
                                objectFit='contain' 
                                style={styles.stream} 
                            />
                        </Animated.View> : null
                    }
                    <GestureDetector gesture={Gesture.Exclusive(panGesture, cameraTapGesture)} > 
                        <Animated.View style={[styles.camera, cameraAnimatedStyle, { backgroundColor: darkTheme.secondary }]} >
                            {!videoCallContext?.isCameraOff && videoCallContext?.localStream ?
                                <>
                                    <RTCView 
                                        streamURL={videoCallContext.localStream.toURL()} 
                                        mirror={videoCallContext.facingMode === 'user'}
                                        zOrder={1} 
                                        style={styles.stream} 
                                    />
                                    <Animated.View style={[styles.cameraRotateButton, cameraRotateButtonAnimatedStyle]}>
                                        <ThemedButton
                                            onPress={() => { if(videoCallContext.isCallStarted) startTimer() ; videoCallContext.switchCamera() }}
                                            height={40}
                                            width={40}
                                            shape='circular'
                                            backgroundColor={lightTheme.secondaryText}
                                        >
                                            <CameraRotateBoldIcon fill={lightTheme.primary} />
                                        </ThemedButton>
                                    </Animated.View>
                                </> :
                                <Animated.Image
                                    source={authContext?.user?.imageProfile ? { uri: authContext?.user?.imageProfile } : placeholder}
                                    style={imageProfileAnimatedStyle}
                                />
                            }
                            {videoCallContext?.isMicMuted ?
                                <Animated.View style={[styles.micOffIcon, micOffIconAnimatedStyle]} >
                                    <MicOffBoldIcon height={18} width={18} fill={darkTheme.error} />
                                </Animated.View> : null
                            }
                        </Animated.View>
                    </GestureDetector>
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
                        {userName ?
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
                                onPress={() => { 
                                    videoCallContext.updateEndCallStatus(undefined); 
                                    videoCallContext.updateOtherUser(undefined);
                                    router.back();
                                }}
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
                                    onPress={() => {
                                        const contactId = videoCallContext.otherUser && isContact(videoCallContext.otherUser) ? videoCallContext.otherUser.id : undefined;
                                        const targetUserId = videoCallContext.otherUser && isContact(videoCallContext.otherUser) ? videoCallContext.otherUser.user?.id :
                                            videoCallContext.otherUser?.id;
                                        const targetPhone = videoCallContext.otherUser?.phone;    

                                        if(targetUserId && targetPhone) {
                                            videoCallContext.updateEndCallStatus(undefined);
                                            videoCallContext.startCall(targetUserId, targetPhone, contactId, true);
                                        }
                                    }}
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
            <VideoCallBottomSheet ref={bottomSheetRef} onDismiss={() => { if(videoCallContext?.isCallStarted) startTimer(); }} />
            <ThemedSnackBar />
        </View>
    );
}

const styles = StyleSheet.create({
    main: { 
        flex: 1
    },
    inner: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textGroup: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute'
    },
    imageProfile: {
        marginBottom: 35
    },
    controlBar: {
        alignSelf: 'center',
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
        overflow: 'hidden'
    },
    stream: {
        height: '100%',
        width: '100%'
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
    },
    mutedGroup: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20, 
        paddingVertical: 2, 
        paddingLeft: 12, 
        paddingRight: 16 
    },
    mutedIcon: {
        position: 'absolute',  
        left: 10
    },
    mutedText: { 
        marginLeft: 4
    },
    indicator: {
        position: 'absolute',  
        right: 10
    }
});
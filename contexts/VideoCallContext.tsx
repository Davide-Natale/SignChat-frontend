import { Contact } from "@/types/Contact";
import { CustomUser } from "@/types/User";
import { socket } from "@/utils/webSocket";
import { Href, useRouter } from "expo-router";
import React, { createContext, useEffect, useRef, useState } from "react";
import InCallManager from 'react-native-incall-manager';
import { Audio } from 'expo-av';
import DeviceInfo from "react-native-device-info";
import notifee from '@notifee/react-native';
import * as mediasoup from 'mediasoup-client';
import { mediaDevices, MediaStream, MediaStreamTrack } from "react-native-webrtc";
import { Response } from "@/types/Response";

type OtherUserStatus = { muted: boolean, videoPaused: boolean}
type EndCallStatus = "unanswered" | "rejected";
type NavigateMode = 'push' | 'replace';

export const isContact = (obj: CustomUser | Contact): obj is Contact => {
    return 'user' in obj;
}

export interface VideoCallContextType {
    callIdRef: React.MutableRefObject<number | undefined>;
    isRinging: boolean;
    isRingingRef: React.MutableRefObject<boolean>;
    isCallStarted: boolean;
    duration: number;
    otherUser: Contact | CustomUser | undefined;
    otherUserStatus: OtherUserStatus; 
    endCallStatus: EndCallStatus | undefined;
    isMicMuted: boolean;
    isCameraOff: boolean;
    facingMode: 'user' | 'environment';
    localStream: MediaStream | undefined;
    remoteStream: MediaStream | undefined;
    localStreamRef: React.MutableRefObject<MediaStream | undefined>;
    deviceRef: React.MutableRefObject<mediasoup.types.Device | undefined>;
    sendTransportRef: React.MutableRefObject<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>;
    recvTransportRef: React.MutableRefObject<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>;
    videoProducerRef: React.MutableRefObject<mediasoup.types.Producer<mediasoup.types.AppData> | undefined>;
    audioProducerRef: React.MutableRefObject<mediasoup.types.Producer<mediasoup.types.AppData> | undefined>;
    videoConsumerRef: React.MutableRefObject<mediasoup.types.Consumer<mediasoup.types.AppData> | undefined>;
    audioConsumerRef: React.MutableRefObject<mediasoup.types.Consumer<mediasoup.types.AppData> | undefined>;
    updateIsRinging: React.Dispatch<React.SetStateAction<boolean>>;
    updateIsCallStarted: React.Dispatch<React.SetStateAction<boolean>>;
    updateOtherUser: React.Dispatch<React.SetStateAction<CustomUser | Contact | undefined>>;
    updateEndCallStatus: React.Dispatch<React.SetStateAction<EndCallStatus | undefined>>;
    updateLocalStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>;
    updateOtherUserStatus: (kind: 'audio' | 'video', isPaused: boolean) => void;
    resetOtherUserStatus: () => void;
    resetIsMicMuted: () => void;
    resetIsCameraOff: () => void;
    toggleIsMicMuted: () => void;
    toggleIsCameraOff: () => void;
    switchCamera: () => void;
    initializeDevice: () => Promise<void>;
    clearDevice: () => void;
    clearRemoteStream: () => void;
    startCall: (targetUserId: number, targetPhone: string, contactId?: number, isRetry?: boolean) => Promise<void>;
    endCall: () => void;
    answerCall: (callId: number, callerUserId: number, contactId?: number, navigateMode?: NavigateMode) => Promise<void>;
    rejectCall: (callId: number, callerUserId: number, goBack?: boolean) => Promise<void>;
}

export const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [isRinging, setIsRinging] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [otherUser, setOtherUser] = useState<Contact | CustomUser>();
    const [otherUserStatus, setOtherUserStatus] = useState<OtherUserStatus>({ muted: false, videoPaused: false });
    const [endCallStatus, setEndCallStatus] = useState<EndCallStatus>();
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [localStream, setLocalStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<MediaStream>();
    const callIdRef = useRef<number>();
    const isRingingRef = useRef(isRinging);
    const ringbackSoundRef = useRef<Audio.Sound>();
    const localStreamRef = useRef<MediaStream>();
    const deviceRef = useRef<mediasoup.types.Device>();
    const sendTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData>>();
    const recvTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData>>();
    const videoProducerRef = useRef<mediasoup.types.Producer<mediasoup.types.AppData>>();
    const audioProducerRef = useRef<mediasoup.types.Producer<mediasoup.types.AppData>>();
    const videoConsumerRef = useRef<mediasoup.types.Consumer<mediasoup.types.AppData>>();
    const audioConsumerRef = useRef<mediasoup.types.Consumer<mediasoup.types.AppData>>();
    const intervalRef = useRef<NodeJS.Timeout>();

    const stopInterval = () => {
        if(intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
            setDuration(0);
        }
    };

    useEffect(() => {
        const loadRingbackSound = async () => {
            const { sound } = await Audio.Sound.createAsync(require('@/assets/audios/ringback.wav'), { shouldPlay: false, isLooping: true });
            ringbackSoundRef.current = sound;
        };

        loadRingbackSound();

        return () => { if(ringbackSoundRef.current) { ringbackSoundRef.current.unloadAsync(); }};
    }, []);

    useEffect(() => {
        isRingingRef.current = isRinging;

        if(isRinging) {
            ringbackSoundRef.current?.playAsync();
        } else {
            ringbackSoundRef.current?.stopAsync();
        }
    }, [isRinging]);
 
    useEffect(() => {
        if(isCallStarted) {
            intervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            stopInterval();
        }    

        return () => stopInterval();
    }, [isCallStarted]);

    useEffect(() => {
        if(videoConsumerRef.current && !remoteStream) {
            const remoteStream = new MediaStream([videoConsumerRef.current.track as unknown as MediaStreamTrack]);
            setRemoteStream(remoteStream);
        }
    }, [videoConsumerRef.current]);

    const initializeDevice = async () => {
        socket.emit('getRouterRtpCapabilities', async (capabilities: mediasoup.types.RtpCapabilities | null) => {
            if(capabilities) {
                deviceRef.current = new mediasoup.Device();
                await deviceRef.current.load({ routerRtpCapabilities: capabilities});
            }
        });
    };

    const clearDevice = () => {
        deviceRef.current = undefined;
    };

    const clearRemoteStream = () => {
        setRemoteStream(undefined);
    };

    const startCall = async (targetUserId: number, targetPhone: string, contactId?: number, isRetry: boolean = false) => {
        socket.emit("call-user", { targetUserId, targetPhone });
        InCallManager.start({ media: 'video' });
        const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        
        if(!isRetry) {
            router.push({ 
                pathname: '/video-call', 
                params: { 
                    contactId, 
                    userId: !contactId ? targetUserId : undefined 
                } 
            });
        }
    };

    const endCall = () => {
        if(callIdRef.current && otherUser) {
            const checkContact = isContact(otherUser);
            socket.emit("end-call", { 
                callId: callIdRef.current, 
                otherUserId: checkContact ? otherUser.user?.id : otherUser.id
            });
        }  
    };

    const answerCall = async (callId: number, callerUserId: number, contactId?: number, navigateMode: NavigateMode = 'push') => {
        const deviceId = await DeviceInfo.getUniqueId();
        const navigationConfig: Href= {
            pathname: '/video-call', 
            params: { 
                contactId, 
                userId: !contactId ? callerUserId : undefined 
            } 
        };

        socket.emit("answer-call", { callId, callerUserId, deviceId});
        InCallManager.stopRingtone();
        notifee.cancelNotification(callId.toString());
        InCallManager.start({ media: 'video' });

        if(navigateMode === 'replace') {
            router.replace(navigationConfig);
        } else {
            router.push(navigationConfig);
        }
    };

    const rejectCall = async (callId: number, callerUserId: number, goBack: boolean = false) => {
        const deviceId = await DeviceInfo.getUniqueId();
        socket.emit("reject-call", { callId, callerUserId, deviceId});
        InCallManager.stopRingtone();
        notifee.cancelNotification(callId.toString());
        
        if(goBack) {
            setOtherUser(undefined);
            router.back();
        }
    };

    const resetIsMicMuted = () => {
        setIsMicMuted(false);
    };

    const resetIsCameraOff = () => {
        setIsCameraOff(false);
    };

    const toggleIsMicMuted = () => {
        const isMicMutedOld = isMicMuted;
        const producerId = audioProducerRef.current?.id;
        const action = isMicMuted ? 'resume-producer' : 'pause-producer';

        if(!producerId) return;

        setIsMicMuted(prev => !prev);
        socket.emit(action, { producerId }, (response: Response) => {
            if(response.success) {
                if(isMicMutedOld) {
                    audioProducerRef.current?.resume();
                } else {
                    audioProducerRef.current?.pause();
                }
            } else {
                //  TODO: handle with ErrorContext
                console.log(response.error);
                setIsMicMuted(isMicMutedOld);
            }
        });
    };

    const toggleIsCameraOff = () => {
        const isCameraOffOld = isCameraOff;
        const producerId = videoProducerRef.current?.id;
        const action = isCameraOff ? 'resume-producer' : 'pause-producer';

        if(!producerId) return;

        setIsCameraOff(prev => !prev);
        socket.emit(action, { producerId }, (response: Response) => {
            if(response.success) {
                if(isCameraOffOld) {
                    videoProducerRef.current?.resume();
                } else {
                    videoProducerRef.current?.pause();
                }
            } else {
                //  TODO: handle with ErrorContext
                console.log(response.error);
                setIsCameraOff(isCameraOffOld);
            }
        });
    };

    const switchCamera = async () => {
        const track = localStream?.getVideoTracks()[0];
        const oldConstraints = track?.getConstraints();

        track?.applyConstraints({ 
            ...oldConstraints, 
            facingMode: facingMode === 'user' ? 'environment' : 'user' 
        });
        
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const updateOtherUserStatus = (kind: 'audio' | 'video', isPaused: boolean) => {
        setOtherUserStatus(prev => ({
            ...prev,
            ...(kind === 'audio' ? { muted: isPaused } : { videoPaused: isPaused })
        }));
    };

    const resetOtherUserStatus = () => {
        setOtherUserStatus({ muted: false, videoPaused: false });
    };

    return(
        <VideoCallContext.Provider value={
            {
                callIdRef,
                isRinging,
                isRingingRef,
                isCallStarted,
                duration,
                otherUser,
                endCallStatus,
                otherUserStatus,
                isMicMuted,
                isCameraOff,
                facingMode,
                localStream,
                remoteStream,
                localStreamRef,
                deviceRef,
                sendTransportRef,
                recvTransportRef,
                videoProducerRef,
                audioProducerRef,
                videoConsumerRef,
                audioConsumerRef,
                updateIsRinging: setIsRinging,
                updateIsCallStarted: setIsCallStarted,
                updateOtherUser: setOtherUser,
                updateEndCallStatus: setEndCallStatus,
                updateLocalStream: setLocalStream,
                updateOtherUserStatus,
                resetOtherUserStatus,
                resetIsMicMuted,
                resetIsCameraOff,
                toggleIsMicMuted,
                toggleIsCameraOff,
                switchCamera,
                initializeDevice,
                clearDevice,
                clearRemoteStream,
                startCall,
                endCall,
                answerCall,
                rejectCall
            }
        }>
            {children}
        </VideoCallContext.Provider>
    );
}; 
import { Contact } from "@/types/Contact";
import { User } from "@/types/User";
import { socket } from "@/utils/webSocket";
import { useRouter } from "expo-router";
import React, { createContext, useEffect, useRef, useState } from "react";
import InCallManager from 'react-native-incall-manager';
import { Audio } from 'expo-av';
import DeviceInfo from "react-native-device-info";

type EndCallStatus = "unanswered" | "rejected";
type CustomUser = Omit<User, 'email'> & { id: number };

export const isContact = (obj: CustomUser | Contact): obj is Contact => {
    return 'user' in obj;
}

export interface VideoCallContextType {
    callId: string | undefined;
    isRinging: boolean;
    isRingingRef: React.MutableRefObject<boolean>;
    isCallStarted: boolean;
    duration: number;
    otherUser: Contact | CustomUser | undefined;
    endCallStatus: EndCallStatus | undefined;
    isMicMuted: boolean;
    isCameraOff: boolean;
    updateCallId: React.Dispatch<React.SetStateAction<string | undefined>>;
    updateIsRinging: React.Dispatch<React.SetStateAction<boolean>>;
    updateIsCallStarted: React.Dispatch<React.SetStateAction<boolean>>;
    updateOtherUser: React.Dispatch<React.SetStateAction<CustomUser | Contact | undefined>>;
    updateEndCallStatus: React.Dispatch<React.SetStateAction<EndCallStatus | undefined>>;
    toggleIsMicMuted: () => void;
    toggleIsCameraOff: () => void;
    startCall: (targetUserId: number, targetPhone: string, contactId?: number) => void;
    endCall: () => void;
    answerCall: (callId: number, callerUserId: number, contactId?: number) => Promise<void>;
    rejectCall: (callId: number, callerUserId: number) => Promise<void>;
}

export const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [callId, setCallId] = useState<string>();
    const [isRinging, setIsRinging] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [otherUser, setOtherUser] = useState<Contact | CustomUser>();
    const [endCallStatus, setEndCallStatus] = useState<EndCallStatus>();
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const isRingingRef = useRef(isRinging);
    const ringbackSoundRef = useRef<Audio.Sound>();

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
            const interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [duration, isCallStarted]);

    const startCall = (targetUserId: number, targetPhone: string, contactId?: number) => {
        //socket.emit("call-user", { targetUserId, targetPhone });
        //InCallManager.start({ media: 'video' });
        router.push({ 
            pathname: '/video-call', 
            params: { 
                contactId, 
                userId: !contactId ? targetUserId : undefined 
            } 
        });
    };

    const endCall = () => {
        if(callId && otherUser) {
            const checkContact = isContact(otherUser);
            socket.emit("end-call", { 
                callId, 
                otherUserId: checkContact ? otherUser.user?.id : otherUser.id
            }); 
        }  
    };

    const answerCall = async (callId: number, callerUserId: number, contactId?: number) => {
        //const deviceId = await DeviceInfo.getUniqueId();
        
        //socket.emit("answer-call", { callId, callerUserId, deviceId});
        //InCallManager.start({ media: 'video' });
        router.push({
            pathname: '/video-call', 
            params: { 
                contactId, 
                userId: !contactId ? callerUserId : undefined 
            } 
        });
    };

    const rejectCall = async (callId: number, callerUserId: number) => {
        const deviceId = await DeviceInfo.getUniqueId();
        socket.emit("reject-call", { callId, callerUserId, deviceId});
    };

    const toggleIsMicMuted = () => {
        setIsMicMuted(prev => !prev);
    }

    const toggleIsCameraOff = () => {
        setIsCameraOff(prev => !prev);
    }

    return(
        <VideoCallContext.Provider value={
            {
                callId,
                isRinging,
                isRingingRef,
                isCallStarted,
                duration,
                otherUser,
                endCallStatus,
                isMicMuted,
                isCameraOff,
                updateCallId: setCallId,
                updateIsRinging: setIsRinging,
                updateIsCallStarted: setIsCallStarted,
                updateOtherUser: setOtherUser,
                updateEndCallStatus: setEndCallStatus,
                toggleIsMicMuted,
                toggleIsCameraOff,
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
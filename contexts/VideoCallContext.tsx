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

const isContact = (obj: CustomUser | Contact): obj is Contact => {
    return 'user' in obj;
}

export interface VideoCallContextType {
    callId: string | undefined;
    isRinging: boolean;
    isRingingRef: React.MutableRefObject<boolean>,
    otherUser: Contact | CustomUser | undefined;
    endCallStatus: EndCallStatus | undefined,
    updateCallId: React.Dispatch<React.SetStateAction<string | undefined>>;
    updateIsRinging: React.Dispatch<React.SetStateAction<boolean>>;
    updateOtherUser: React.Dispatch<React.SetStateAction<CustomUser | Contact | undefined>>;
    updateEndCallStatus: React.Dispatch<React.SetStateAction<EndCallStatus | undefined>>,
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
    const isRingingRef = useRef(isRinging);
    const [ringbackSound, setRingbackSound] = useState<Audio.Sound>();
    const [otherUser, setOtherUser] = useState<Contact | CustomUser>();
    const [endCallStatus, setEndCallStatus] = useState<EndCallStatus>();

    useEffect(() => {
        const loadRingbackSound = async () => {
            const { sound } = await Audio.Sound.createAsync(require('@/assets/audios/ringback.wav'), { shouldPlay: false, isLooping: true });
            setRingbackSound(sound);
        };

        loadRingbackSound();

        return () => { if(ringbackSound) { ringbackSound.unloadAsync(); }};
    }, []);

    useEffect(() => {
        isRingingRef.current = isRinging;

        if(isRinging) {
            ringbackSound?.playAsync();
        } else {
            ringbackSound?.stopAsync();
        }
    }, [isRinging]);

    const startCall = (targetUserId: number, targetPhone: string, contactId?: number) => {
        socket.emit("call-user", { targetUserId, targetPhone });
        InCallManager.start({ media: 'video' });
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
        const deviceId = await DeviceInfo.getUniqueId();
        
        socket.emit("answer-call", { callId, callerUserId, deviceId});
        InCallManager.start({ media: 'video' });
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

    return(
        <VideoCallContext.Provider value={
            {
                callId,
                isRinging,
                isRingingRef,
                otherUser,
                endCallStatus,
                updateCallId: setCallId,
                updateIsRinging: setIsRinging,
                updateOtherUser: setOtherUser,
                updateEndCallStatus: setEndCallStatus,
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
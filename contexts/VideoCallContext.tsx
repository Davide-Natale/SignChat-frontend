import { Contact } from "@/types/Contact";
import { User } from "@/types/User";
import { socket } from "@/utils/webSocket";
import { useRouter } from "expo-router";
import React, { createContext, useState } from "react";
import InCallManager from 'react-native-incall-manager';
import { Audio } from 'expo-av';

type CustomUser = Omit<User, 'email'> & { id: number };

const checkContact = (obj: CustomUser | Contact): obj is Contact => {
    return 'user' in obj;
}

interface VideoCallContextType {
    callId: string | undefined;
    isRinging: boolean;
    caller: Contact | CustomUser | undefined;
    updateCallId: React.Dispatch<React.SetStateAction<string | undefined>>;
    updateIsRinging: React.Dispatch<React.SetStateAction<boolean>>;
    updateCaller: React.Dispatch<React.SetStateAction<CustomUser | Contact | undefined>>;
    startCall: (callId: string, callerPhone: string, callerFullName: string, callerId: number, isContact: boolean) => Promise<void>;
    endCall: () => void;
    answerCall: () => void;
    rejectCall: () => void;
}

export const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [callId, setCallId] = useState<string>();
    const [isRinging, setIsRinging] = useState(false);
    const [caller, setCaller] = useState<Contact | CustomUser>();

    const startCall = async (callId: string, callerPhone: string, callerFullName: string, callerId: number, isContact: boolean) => {
        console.log(callId);

        const { sound } = await Audio.Sound.createAsync(require('@/assets/audios/ringback.wav'), { shouldPlay: false, isLooping: true });

        await sound.playAsync();

        setTimeout(() => { sound.stopAsync() ; sound.unloadAsync() }, 60000);

        const userId = callId.split("-")[1];

        //  Emit message to server through WebSocket
        socket.emit("call-user", { to: userId });

        //  Start call ringing
        InCallManager.start({ media: 'video' });

        setCallId(callId);
        router.push({ pathname: '/video-call', params: { callerId, isContact: String(isContact) } });
    };

    const endCall = () => {
        if(callId) {
            setCallId(undefined);
            setIsRinging(false);
            setCaller(undefined);
            InCallManager.stop(); 
        }  
    };

    const answerCall = () => {};

    const rejectCall = () => {};

    return(
        <VideoCallContext.Provider value={
            {
                callId,
                isRinging,
                caller,
                updateCallId: setCallId,
                updateIsRinging: setIsRinging,
                updateCaller: setCaller,
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
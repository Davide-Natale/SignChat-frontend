import { io } from 'socket.io-client';
import { getToken } from './secureStore';
import authAPI from '@/api/authAPI';
import { VideoCallContextType } from '@/contexts/VideoCallContext'
import { Router } from 'expo-router';
import InCallManager from 'react-native-incall-manager';

const SERVER_URL = 'http://192.168.178.183:3000';

export const socket = io(SERVER_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5, 
    reconnectionDelay: 3000,
    transports: ['websocket']
});

const checkAuth = async () => {
    try {
        //  Verify authentication to force token refresh if needed
        await authAPI.verifyAuth();

        //  Retrieve new access token fron Secure Store
        const newAccessToken = await getToken('accessToken');

        return newAccessToken; 
    } catch (error) {
        return null;
    }
}

export const connectSocket = async (context: VideoCallContextType | undefined, router: Router) => {
    const accessToken = await getToken('accessToken');

    if(accessToken && socket.disconnected) {
        socket.auth = { token: `Bearer ${accessToken}` };
        
        socket.on('reconnect_attempt', async () => {
            const latestAccessToken = await getToken('accessToken');
            if(latestAccessToken) socket.auth = { token: `Bearer ${latestAccessToken}` };
        });

        socket.on('reconnect_error', async (error) => {
            if(error.message === 'Access Token missing.' ||
               error.message === 'Access Token blacklisted.' ||
               error.message === 'Invalid Access Token.'
            ) {
                const newAccessToken = await checkAuth();
                if(newAccessToken) socket.auth = { token: `Bearer ${newAccessToken}` };
            } 
        });

        socket.on('connect_error', async (error) => {
            if(error.message === 'Access Token missing.' ||
                error.message === 'Access Token blacklisted.' ||
                error.message === 'Invalid Access Token.'
             ) {
                const newAccessToken = await checkAuth();
                
                if (newAccessToken) {
                    socket.auth = { token: `Bearer ${newAccessToken}` };
                    socket.connect();
                }
             } 
        });

        socket.on('call-started', async ({ callId }) => {
            if(context) {
                context.callIdRef.current = callId;
                context?.updateIsRinging(true);
            } 
        });

        socket.on('call-ended', async ({ reason }) => {
            if(context) {
                context.callIdRef.current = undefined;
                InCallManager.stop();

                if(context?.isRingingRef.current) {
                    context.updateIsRinging(false);
                }

                if(reason === 'completed') {
                    context?.updateIsCallStarted(false);
                    context?.updateOtherUser(undefined);
                    router.back();
                } else {
                    context?.updateEndCallStatus(reason);
                }
            } 
        });

        socket.on('call-joined', async ({ callId }) => {
            if(callId && context) {
                context.callIdRef.current = callId;
                context.updateIsCallStarted(true);
            }
        });

        socket.on('call-answered', async () => {
            if (context?.isRingingRef.current) {
                context.updateIsRinging(false);
            }

            context?.updateIsCallStarted(true);
        });

        socket.on('call-error', async ({ message }) => {
            console.log('Call Error: ', message);
            //  TODO: add error handling with ErrorContext
        });

        socket.connect();
    }
};

export const disconnectSocket = () => {
    if(socket.connected) {
        socket.disconnect();
        socket.removeAllListeners();
    }
};
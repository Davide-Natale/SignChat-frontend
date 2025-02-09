import { io } from 'socket.io-client';
import { getToken } from './secureStore';
import authAPI from '@/api/authAPI';

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

export const connectSocket = async () => {
    const accessToken = await getToken('accessToken');

    if(accessToken) {
        socket.auth = { token: `Bearer ${accessToken}` };
        socket.connect();

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
    }
};

export const disconnectToken = () => {
    if(socket.connected) {
        socket.disconnect();
        socket.off();
    }
};
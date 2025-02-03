import { io } from 'socket.io-client';
import { getToken } from './secureStore';

const SERVER_URL = 'http://192.168.178.183:3000';

const socket = io(SERVER_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5, 
    reconnectionDelay: 3000,
    transports: ['websocket']
});

export const connectSocket = async () => {
    const accessToken = await getToken('accessToken');

    if (accessToken) {
        socket.auth = { token: `Bearer ${accessToken}` };

        socket.connect();

        socket.on('connect', () => {
            console.log('Connected to Socket: ', socket.connected);
        });

        socket.on('disconnect', () => {
            console.log("Disconnected from Socket: ", socket.disconnected);
        });
    }
};

export const disconnectToken = () => {
    if(socket.connected) {
        socket.disconnect();
        socket.off();
    }
};
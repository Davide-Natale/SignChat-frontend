import { io } from 'socket.io-client';
import { getToken } from './secureStore';
import authAPI from '@/api/authAPI';
import { VideoCallContextType } from '@/contexts/VideoCallContext'
import { Router } from 'expo-router';
import InCallManager from 'react-native-incall-manager';
import * as mediasoup from 'mediasoup-client';
import { mediaDevices } from "react-native-webrtc";
import { ErrorResponse } from '@/types/ErrorResponse';
import { Response } from '@/types/Response';

type ProduceResponse = { success: true, id: string } | ErrorResponse;

type ConsumeResponse = { success: true, params: Params } | ErrorResponse;

type Parameters = {
    kind: mediasoup.types.MediaKind;
    rtpParameters: mediasoup.types.RtpParameters;
    appData: mediasoup.types.AppData;
}

type Params = {
    id: string,
    producerId: string,
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters
}

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

const connectTransport = (
    transportId: string, 
    dtlsParameters: mediasoup.types.DtlsParameters, 
    callback: () => void, 
    errback: (error: Error) => void
) => {
    socket.emit('connect-transport', { transportId, dtlsParameters }, (response: Response) => {
        if(response.success) {
            callback();
        } else {
            errback(new Error(response.error));
        }
    });
};

const createProducer = (
    transportId: string,
    parameters: Parameters,
    callback: ({ id }: { id: string }) => void, 
    errback: (error: Error) => void
) => {
    const { kind, rtpParameters, appData } = parameters;

    socket.emit('create-producer', { transportId, kind, rtpParameters, appData }, (response: ProduceResponse) => {
        if(response.success) {
            callback({ id: response.id });
        } else {
            errback(new Error(response.error));
        }
    });
};

const startProducing = async (
    sendTransport: mediasoup.types.Transport<mediasoup.types.AppData>, 
    localStream: MediaStream
) => {
    const videoTrack = localStream.getVideoTracks()[0];
    const audioTrack = localStream.getAudioTracks()[0];

    const videoProducer = await sendTransport.produce({
        track: videoTrack,
        codecOptions: {
            videoGoogleStartBitrate: 1000
        }
    });

    const audioProducer = await sendTransport.produce({ track: audioTrack });

    return { videoProducer, audioProducer };
};

const resumeConsumer = (consumer: mediasoup.types.Consumer<mediasoup.types.AppData> | undefined) => {
    if(consumer) {
        socket.emit('resume-consumer', { consumerId: consumer.id }, (response: Response) => {
            if(response.success && consumer.paused) {
                consumer.resume();
            } else if(!response.success) {
               //  TODO: handle with Error Context
               console.log(response.error); 
            }
        });
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

        socket.on('call-started', async ({ callId, sendTransportParams, recvTransportParams }) => {
            if(context) {
                const sendTransport = context.deviceRef.current?.createSendTransport(sendTransportParams);
                sendTransport?.on('connect', ({ dtlsParameters }, callback, errback) => {
                    connectTransport(sendTransport.id, dtlsParameters, callback, errback);
                });
                sendTransport?.on('produce', (parameters, callback, errback ) => { 
                    createProducer(sendTransport.id, parameters, callback, errback);
                });

                const recvTransport = context.deviceRef.current?.createRecvTransport(recvTransportParams);
                recvTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    connectTransport(recvTransport.id, dtlsParameters, callback, errback);
                });

                context.callIdRef.current = callId;
                context.sendTransportRef.current = sendTransport;
                context.recvTransportRef.current = recvTransport;
                context.updateIsRinging(true);
            } 
        });

        socket.on('call-ended', async ({ reason }) => {
            if(context) {
                context.callIdRef.current = undefined;
                context.sendTransportRef.current?.close();
                context.sendTransportRef.current = undefined;
                context.recvTransportRef.current?.close();
                context.recvTransportRef.current = undefined;
                context.resetIsMicMuted();
                context.resetIsCameraOff();
                InCallManager.stop();

                if(context?.isRingingRef.current) {
                    context.updateIsRinging(false);
                }
                
                if(reason === 'completed') {
                    context.videoProducerRef.current = undefined;
                    context.audioProducerRef.current = undefined;
                    context.videoConsumerRef.current = undefined;
                    context.audioConsumerRef.current = undefined;
                    context.localStreamRef.current = undefined;
                    context.updateLocalStream(undefined);
                    context.clearRemoteStream();
                    context?.updateIsCallStarted(false);
                    context?.updateOtherUser(undefined);
                    context.resetOtherUserStatus();
                    router.back();
                } else {
                    context.localStreamRef.current?.getTracks().forEach(track => track.stop());
                    context.localStreamRef.current = undefined
                    context.updateLocalStream(undefined);
                    context?.updateEndCallStatus(reason);
                }
            } 
        });

        socket.on('call-joined', async ({ callId, sendTransportParams, recvTransportParams }) => {
            if(context) {
                context.callIdRef.current = callId;
                context.updateIsCallStarted(true);
                const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
                context.updateLocalStream(stream);
                context.localStreamRef.current = stream;

                const sendTransport = context.deviceRef.current?.createSendTransport(sendTransportParams);
                sendTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    connectTransport(sendTransport.id, dtlsParameters, callback, errback);
                });
                sendTransport?.on('produce', (parameters, callback, errback ) => {
                    createProducer(sendTransport.id, parameters, callback, errback);
                });

                const recvTransport = context.deviceRef.current?.createRecvTransport(recvTransportParams);
                recvTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    connectTransport(recvTransport.id, dtlsParameters, callback, errback);
                });

                context.sendTransportRef.current = sendTransport;
                context.recvTransportRef.current = recvTransport;
            
                if(context?.sendTransportRef.current) {
                    const { videoProducer, audioProducer } = await startProducing(
                        context.sendTransportRef.current, 
                        context.localStreamRef.current as unknown as MediaStream
                    );
    
                    context.videoProducerRef.current = videoProducer;
                    context.audioProducerRef.current = audioProducer;

                    socket.emit('readyToConsume');
                }
            }
        });

        socket.on('call-answered', async () => {
            try {
                if (context?.isRingingRef.current) {
                    context.updateIsRinging(false);
                }
    
                context?.updateIsCallStarted(true);

                if(context?.sendTransportRef.current) {
                    const { videoProducer, audioProducer } = await startProducing(
                        context.sendTransportRef.current, 
                        context.localStreamRef.current as unknown as MediaStream
                    );

                    context.videoProducerRef.current = videoProducer;
                    context.audioProducerRef.current = audioProducer;

                    socket.emit('readyToConsume');
                }
            } catch (error) {
                //  TODO: handle using Error Context
                console.log(error);
            }
        });

        socket.on('new-producer', ({ producerId }) => {
            if(context?.deviceRef.current && context.recvTransportRef.current) {
                const transportId = context.recvTransportRef.current?.id;
                const rtpCapabilities = context.deviceRef.current.rtpCapabilities;

                socket.emit('create-consumer', { transportId, producerId, rtpCapabilities }, async (response: ConsumeResponse) => {
                    if(response.success) {
                        const { params } = response;
                        const consumer = await context.recvTransportRef.current?.consume({
                            id: params.id,
                            producerId: params.producerId,
                            kind: params.kind,
                            rtpParameters: params.rtpParameters
                        });

                        if(params.kind === 'audio') {
                            context.audioConsumerRef.current = consumer;
                            resumeConsumer(context.audioConsumerRef.current);
                        } else {
                            context.videoConsumerRef.current = consumer;
                            resumeConsumer(context.videoConsumerRef.current);
                        }
                    } else {
                        //  TODO: handle with Error Context
                        console.log(response.error);
                    }
                });
            }
            
        });

        socket.on('producer-paused', ({ kind }) => {
            context?.updateOtherUserStatus(kind, true);
        });

        socket.on('producer-resumed', ({ kind }) => {
            context?.updateOtherUserStatus(kind, false);
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
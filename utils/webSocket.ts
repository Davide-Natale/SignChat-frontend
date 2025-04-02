import { io } from 'socket.io-client';
import { getToken } from './secureStore';
import authAPI from '@/api/authAPI';
import { VideoCallContextType } from '@/contexts/VideoCallContext'
import { router } from 'expo-router';
import InCallManager from 'react-native-incall-manager';
import * as mediasoup from 'mediasoup-client';
import { mediaDevices } from "react-native-webrtc";
import { ErrorResponse } from '@/types/ErrorResponse';
import { Response } from '@/types/Response';
import { ConnectionQuality } from '@/types/ConnectionQuality';
import { ErrorContextType } from '@/contexts/ErrorContext';

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

const resumeConsumer = (
    consumer: mediasoup.types.Consumer<mediasoup.types.AppData> | undefined, 
    errorContext: ErrorContextType | undefined
) => {
    if(consumer) {
        socket.emit('resume-consumer', { consumerId: consumer.id }, (response: Response) => {
            if(response.success && consumer.paused) {
                consumer.resume();
            } else if(!response.success) {
                errorContext?.handleError(new Error(response.error));
            }
        });
    }
}

export const connectSocket = async (
    videoCallContext: VideoCallContextType | undefined, 
    errorContext: ErrorContextType | undefined
) => {
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
            if(videoCallContext) {
                const sendTransport = videoCallContext.deviceRef.current?.createSendTransport(sendTransportParams);
                sendTransport?.on('connect', ({ dtlsParameters }, callback, errback) => {
                    connectTransport(sendTransport.id, dtlsParameters, callback, errback);
                });
                sendTransport?.on('produce', (parameters, callback, errback ) => { 
                    createProducer(sendTransport.id, parameters, callback, errback);
                });

                const recvTransport = videoCallContext.deviceRef.current?.createRecvTransport(recvTransportParams);
                recvTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    connectTransport(recvTransport.id, dtlsParameters, callback, errback);
                });

                videoCallContext.sendTransportRef.current = sendTransport;
                videoCallContext.recvTransportRef.current = recvTransport;
                videoCallContext.updateCallId(callId);
                videoCallContext.updateIsRinging(true);
                videoCallContext.updateNotificationType('ringing');
            } 
        });

        socket.on('call-ended', async ({ reason }) => {
            if(videoCallContext) {
                videoCallContext.sendTransportRef.current?.close();
                videoCallContext.sendTransportRef.current = undefined;
                videoCallContext.recvTransportRef.current?.close();
                videoCallContext.recvTransportRef.current = undefined;
                videoCallContext.updateNotificationType('none');
                videoCallContext.resetIsMicMuted();
                videoCallContext.resetIsCameraOff();
                videoCallContext.resetFacingMode();
                InCallManager.stop();

                if(videoCallContext.isRingingRef.current) {
                    videoCallContext.updateIsRinging(false);
                }
                
                if(reason === 'completed') {
                    videoCallContext.videoProducerRef.current = undefined;
                    videoCallContext.audioProducerRef.current = undefined;
                    videoCallContext.videoConsumerRef.current = undefined;
                    videoCallContext.audioConsumerRef.current = undefined;
                    videoCallContext.localStreamRef.current = undefined;
                    videoCallContext.updateLocalStream(undefined);
                    videoCallContext.clearRemoteStream();
                    videoCallContext.updateIsCallStarted(false);
                    videoCallContext.updateOtherUser(undefined);
                    videoCallContext.updateConnectionQuality(undefined);
                    videoCallContext.resetOtherUserStatus();
                    router.back();
                } else {
                    videoCallContext.localStreamRef.current?.getTracks().forEach(track => track.stop());
                    videoCallContext.localStreamRef.current = undefined
                    videoCallContext.updateLocalStream(undefined);
                    videoCallContext.updateEndCallStatus(reason);
                }
            } 
        });

        socket.on('call-joined', async ({ callId, sendTransportParams, recvTransportParams }) => {
            if(videoCallContext) {
                videoCallContext.updateCallId(callId);
                videoCallContext.updateIsCallStarted(true);
                videoCallContext.updateNotificationType('ongoing');
                const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
                videoCallContext.updateLocalStream(stream);
                videoCallContext.localStreamRef.current = stream;

                const sendTransport = videoCallContext.deviceRef.current?.createSendTransport(sendTransportParams);
                sendTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    connectTransport(sendTransport.id, dtlsParameters, callback, errback);
                });
                sendTransport?.on('produce', (parameters, callback, errback ) => {
                    createProducer(sendTransport.id, parameters, callback, errback);
                });

                const recvTransport = videoCallContext.deviceRef.current?.createRecvTransport(recvTransportParams);
                recvTransport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    connectTransport(recvTransport.id, dtlsParameters, callback, errback);
                });

                videoCallContext.sendTransportRef.current = sendTransport;
                videoCallContext.recvTransportRef.current = recvTransport;
            
                if(videoCallContext?.sendTransportRef.current) {
                    const { videoProducer, audioProducer } = await startProducing(
                        videoCallContext.sendTransportRef.current, 
                        videoCallContext.localStreamRef.current as unknown as MediaStream
                    );
    
                    videoCallContext.videoProducerRef.current = videoProducer;
                    videoCallContext.audioProducerRef.current = audioProducer;

                    socket.emit('readyToConsume');
                }
            }
        });

        socket.on('call-answered', async () => {
            try {
                if (videoCallContext?.isRingingRef.current) {
                    videoCallContext.updateIsRinging(false);
                }
    
                videoCallContext?.updateIsCallStarted(true);
                videoCallContext?.updateNotificationType('ongoing');

                if(videoCallContext?.sendTransportRef.current) {
                    const { videoProducer, audioProducer } = await startProducing(
                        videoCallContext.sendTransportRef.current, 
                        videoCallContext.localStreamRef.current as unknown as MediaStream
                    );

                    videoCallContext.videoProducerRef.current = videoProducer;
                    videoCallContext.audioProducerRef.current = audioProducer;

                    socket.emit('readyToConsume');
                }
            } catch (error) {
                errorContext?.handleError(error);
            }
        });

        socket.on('new-producer', ({ producerId }) => {
            if(videoCallContext?.deviceRef.current && videoCallContext.recvTransportRef.current) {
                const transportId = videoCallContext.recvTransportRef.current?.id;
                const rtpCapabilities = videoCallContext.deviceRef.current.rtpCapabilities;

                socket.emit('create-consumer', { transportId, producerId, rtpCapabilities }, async (response: ConsumeResponse) => {
                    if(response.success) {
                        const { params } = response;
                        const consumer = await videoCallContext.recvTransportRef.current?.consume({
                            id: params.id,
                            producerId: params.producerId,
                            kind: params.kind,
                            rtpParameters: params.rtpParameters
                        });

                        if(params.kind === 'audio') {
                            videoCallContext.audioConsumerRef.current = consumer;
                            resumeConsumer(videoCallContext.audioConsumerRef.current, errorContext);
                        } else {
                            videoCallContext.videoConsumerRef.current = consumer;
                            resumeConsumer(videoCallContext.videoConsumerRef.current, errorContext);
                        }
                    } else {
                        errorContext?.handleError(new Error(response.error));
                    }
                });
            }
            
        });

        socket.on('producer-paused', ({ kind }) => {
            videoCallContext?.updateOtherUserStatus(kind, true);
        });

        socket.on('producer-resumed', ({ kind }) => {
            videoCallContext?.updateOtherUserStatus(kind, false);
        });

        socket.on('score-changed', ({ score }) => {
            const connectionQuality: ConnectionQuality = score >= 0 && score <= 2 ? 'Low' : 
                score >= 3 && score <= 6 ? 'Mid' : 'Good';

            videoCallContext?.updateConnectionQuality(connectionQuality);
        });

        socket.on('call-error', async ({ message }) => {
            setTimeout(() => { 
                errorContext?.handleError(new Error(message)); 

                setTimeout(() => {
                    if (videoCallContext) {
                        videoCallContext.sendTransportRef.current = undefined;
                        videoCallContext.recvTransportRef.current = undefined;
                        videoCallContext.videoProducerRef.current = undefined;
                        videoCallContext.audioProducerRef.current = undefined;
                        videoCallContext.videoConsumerRef.current = undefined;
                        videoCallContext.audioConsumerRef.current = undefined;
                        videoCallContext.localStreamRef.current?.getTracks().forEach(track => track.stop());
                        videoCallContext.localStreamRef.current = undefined
                        videoCallContext.updateNotificationType('none');
                        videoCallContext.updateIsRinging(false);
                        videoCallContext.resetIsMicMuted();
                        videoCallContext.resetIsCameraOff();
                        videoCallContext.resetFacingMode();
                        videoCallContext.updateLocalStream(undefined);
                        videoCallContext.clearRemoteStream();
                        videoCallContext.updateIsCallStarted(false);
                        videoCallContext.updateOtherUser(undefined);
                        videoCallContext.updateConnectionQuality(undefined);
                        videoCallContext.resetOtherUserStatus();
                        InCallManager.stop();
                        router.back();
                    }
                }, 2000);
            }, 1000);
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
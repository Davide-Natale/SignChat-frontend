import axiosInstance from "@/utils/axiosInstance";

async function createToken(fcmToken: string, deviceId: string) {
    //  Call POST /api/tokens
    await axiosInstance({
        method: 'post',
        url: '/tokens',
        data: { fcmToken, deviceId },
        headers: { 'Content-Type': 'application/json' }
    });
}

async function syncToken(fcmToken: string, deviceId: string) {
    //  Call POST /api/tokens/sync
    await axiosInstance({
        method: 'post',
        url: '/tokens/sync',
        data: { fcmToken, deviceId },
        headers: { 'Content-Type': 'application/json' }
    });
}

async function deleteToken(fcmToken: string) {
    //  Call DELETE /api/tokens
    await axiosInstance({
        method: 'delete',
        url: '/tokens',
        data: { fcmToken },
        headers: { 'Content-Type': 'application/json' }
    });
}

const tokensAPI = { createToken, syncToken, deleteToken }

export default tokensAPI;
import axiosInstance from "@/utils/axiosInstance";

async function createToken(expoToken: string) {
    //  Call POST /api/tokens
    await axiosInstance({
        method: 'post',
        url: '/tokens',
        data: { expoToken },
        headers: { 'Content-Type': 'application/json' }
    });
}

async function deleteToken(expoToken: string) {
    //  Call DELETE /api/tokens
    await axiosInstance({
        method: 'delete',
        url: '/tokens',
        data: { expoToken },
        headers: { 'Content-Type': 'application/json' }
    });
}

const tokensAPI = { createToken, deleteToken }

export default tokensAPI;
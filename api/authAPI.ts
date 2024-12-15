import axiosInstance from "@/utils/axiosInstance";

async function register(email: string, password: string) {
    //  Call POST /api/auth/register
    const { data } = await axiosInstance({
        method: 'post',
        url: '/auth/register',
        data: { email, password },
        headers: { 'Content-Type': 'application/json' }
    });

    return data;
}

async function login(email: string, password: string) {
    //  Call POST /api/auth/login
    const { data } = await axiosInstance({
        method: 'post',
        url: '/auth/register',
        data: { email, password },
        headers: { 'Content-Type': 'application/json' }
    });

    return data;
}

async function changePassword(oldPassword: string, newPassword: string) {
    //  Call POST /api/auth/change-password
    await axiosInstance({
        method: 'post',
        url: '/auth/change-password',
        data: { oldPassword, newPassword },
        headers: { 'Content-Type': 'application/json' }
    });
}

async function requestOtp(email: string) {
    //  Call POST /api/auth/reset-password/request
    await axiosInstance({
        method: 'post',
        url: '/auth/reset-password/request',
        data: { email },
        headers: { 'Content-Type': 'application/json'}
    });
}

async function resetPassword(email: string, otp: string, newPassword: string) {
    //  Call POST /api/auth/reset-password/confirm
    await axiosInstance({
        method: 'post',
        url: '/auth/reset-password/confirm',
        data: { email, otp, newPassword },
        headers: { 'Content-Type': 'application/json' }
    });
}

async function logout(refreshToken: string) {
    //  Call POST /api/auth/logout
    await axiosInstance({
        method: 'post',
        url: '/auth/logout',
        data: { refreshToken },
        headers: { 'Content-Type': 'application/json' }
    });
}

async function verifyAuth() {
    //  Call POST /api/auth/verify
    await axiosInstance({
        method: 'post',
        url: '/auth/verify',
    });
}

const authAPI = { register,  login, changePassword, requestOtp, resetPassword, logout, verifyAuth };

export default authAPI;
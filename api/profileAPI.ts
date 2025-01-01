import axiosInstance from "@/utils/axiosInstance";

export interface User {
    firstName: string, 
    lastName: string,
    email: string,
    phone: string,
    imageProfile: string | null 
}

async function getProfile(): Promise<User> {
    //  Call GET /api/profile
    const { data } = await axiosInstance('/profile');

    const user: User = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        imageProfile: data.imageProfile
    }

    return user;
}

async function updateProfile(user: Omit<User, 'imageProfile'>) {
    //  Call PUT /api/profile
    await axiosInstance({
        method: 'put',
        url: '/profile',
        data: user,
        headers: { 'Content-Type':  'application/json'}
    });
}

async function deleteAccount(refreshToken: string) {
    //  Call DELETE /api/profile
    await axiosInstance({ 
        method: 'delete',
        url: '/profile',
        data: { refreshToken },
        headers: { 'Content-Type': 'application/json' }
    });
}

const profileAPI = { getProfile, updateProfile, deleteAccount };

export default profileAPI;
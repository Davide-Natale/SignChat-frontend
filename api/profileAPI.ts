import { ImageProfileType } from "@/types/ImageProfileType";
import { User } from "@/types/User";
import axiosInstance from "@/utils/axiosInstance";

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

async function uploadProfileImage(imageProfile: Extract<ImageProfileType, { type: 'local' }>) {
    const formData = new FormData();
    formData.append('image', {
        uri: imageProfile.uri,
        type: imageProfile.mimeType,
        name: imageProfile.fileName
    } as any);

    //  Call POST /api/profile/image
    await axiosInstance({
        method: 'post',
        url: '/profile/image',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 
    });
}

async function deleteProfileImage() {
    //  Call DELETE /api/profile/image
    await axiosInstance({
        method: 'delete',
        url: '/profile/image'
    });
}

const profileAPI = { getProfile, updateProfile, deleteAccount, uploadProfileImage, deleteProfileImage };

export default profileAPI;
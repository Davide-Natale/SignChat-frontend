import { User } from "@/types/User";
import axiosInstance from "@/utils/axiosInstance";

type CustomUser = Omit<User, 'email'> & { id: number }

async function getUser(id: number): Promise<CustomUser> {
    //  Call GET /api/users/:id
    const { data } = await axiosInstance(`/users/${id}`);

    const user: CustomUser = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
        imageProfile: data.user.imageProfile
    };

    return user;
}

const usersAPI = { getUser };

export default usersAPI;
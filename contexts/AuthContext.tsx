import { createContext, useContext, useEffect, useState } from "react";
import authAPI from "@/api/authAPI";
import { deleteToken, getToken, saveToken } from "@/utils/secureStore";
import { AppContext } from "./AppContext";
import profileAPI from "@/api/profileAPI";
import { User } from "@/types/User";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | undefined;
    register: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appContext = useContext(AppContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                //  Read access and refresh token from Secure Store
                const accessToken = await getToken('accessToken');
                const refreshToken = await getToken('refreshToken');

                if(!accessToken || !refreshToken) {
                    //  At least one of the two tokens is missing, so the user is not authenticated
                    return;
                }

                //  Verify authentication
                await authAPI.verifyAuth();
                
                //  Update auth state since user is authenticated
                setIsAuthenticated(true);
            } catch (error) {
                //  No need to do anything: user is simply not yet authenticated
            } finally {
                appContext?.updateIsReady(true);
            }
        };

        checkAuth();
    }, []); 

    const registerHandler = async (email: string, password: string) => {
        try {
            const { tokens } = await authAPI.register(email, password);
            const { accessToken, refreshToken } = tokens;

            //  Store tokens in the Secure Store
            await saveToken('accessToken', accessToken);
            await saveToken('refreshToken', refreshToken);

            //  Update auth state
            setIsAuthenticated(true);
        } catch (error) {
            // Delete both tokens from Secure Store to avoid partial storage
            await deleteToken('accessToken');
            await deleteToken('refreshToken');

            //  Propagate error
            throw error;
        }
    };

    const loginHandler = async (email: string, password: string) => {
        try {
            const { accessToken, refreshToken } = await authAPI.login(email, password);

            //  Store tokens in the Secure Store
            await saveToken('accessToken', accessToken);
            await saveToken('refreshToken', refreshToken);

            //  Update auth state
            setIsAuthenticated(true);
        } catch (error) {
            // Delete both tokens from Secure Store to avoid partial storage
            await deleteToken('accessToken');
            await deleteToken('refreshToken');

            //  Propagate error
            throw error;
        }
    };

    const logoutHandler = async () => {
        //  Read refresh token from Secure Store
        const refreshToken = await getToken('refreshToken');

        if(refreshToken) {
            await authAPI.logout(refreshToken);
        }

        //  In any case, remove tokens from Secure Store and update auth state
        await deleteToken('accessToken');
        await deleteToken('refreshToken');

        setIsAuthenticated(false);
    }; 

    const fetchProfile = async () => {
        try {
            const user = await profileAPI.getProfile();
            setUser(user);
        } catch (error) {
            //  No need to do anything
        }
    };
    
    const deleteAccount = async () => {
        //  Read refresh token from Secure Store
        const refreshToken = await getToken('refreshToken');

        if(refreshToken) {
            await profileAPI.deleteAccount(refreshToken);
        }

        //  In any case, remove tokens from Secure Store and update auth state
        await deleteToken('accessToken');
        await deleteToken('refreshToken');

        setIsAuthenticated(false);
    }
 
    return(
        <AuthContext.Provider value={
            { 
                isAuthenticated, 
                user,
                register: registerHandler, 
                login: loginHandler, 
                logout: logoutHandler,
                fetchProfile,
                deleteAccount
            }
        }>
            {children}
        </AuthContext.Provider>
    );
}
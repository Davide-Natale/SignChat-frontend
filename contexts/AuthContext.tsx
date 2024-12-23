import { createContext, useContext, useEffect, useState } from "react";
import authAPI from "@/api/authAPI";
import { deleteToken, getToken, saveToken } from "@/utils/secureStore";
import { isAxiosError } from "axios";
import { AppContext } from "./AppContext";

interface AuthContextType {
    isAuthenticated: boolean,
    register: (email: string, password: string) => Promise<void>,
    login: (email: string, password: string) => Promise<void>,
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appContext = useContext(AppContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
                if(isAxiosError(error)) {
                    //  No need to do anything: user is simply not yet authenticated
                    //  Handle error 
                    console.log('User not authenticated', error.response?.data.message);
                }
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

    return (
        <AuthContext.Provider value={{ isAuthenticated, register: registerHandler, login: loginHandler, logout: logoutHandler }}>
            {children}
        </AuthContext.Provider>
    );
}
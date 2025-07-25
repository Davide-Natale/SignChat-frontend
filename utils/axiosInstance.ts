import axios, { isAxiosError } from "axios";
import { deleteToken, getToken, saveToken } from "./secureStore";

//  Use local Ip address of pc when using real device or 10.0.2.2 with emulator
const API_BASE_URL = "http://192.168.178.183:3000/api";   

//  Create and configure an Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000
});

let refreshTokenPromise: Promise<string | null> | null = null;

//  Request interceptor to attach access token
axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await getToken('accessToken');

        if(accessToken) 
            config.headers.Authorization = `Bearer ${accessToken}`;

        return config;
    },
    (error) => Promise.reject(error)
);

//  Response interceptor to handle tokens refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if(isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
            //  This parameter is used to ensures that the
            //  request is resend only one time and avoid loop
            originalRequest._retry = true;

            if (!refreshTokenPromise) {
                refreshTokenPromise = (async () => {

                    //  Read refresh token from Secure Store
                    const refreshToken = await getToken('refreshToken');

                    if(!refreshToken) return null;

                    try {
                        //  Send request to refresh token api
                        const { data } = await axios({
                            method: 'post',
                            url: `${API_BASE_URL}/auth/refresh-token`, 
                            data: { refreshToken }, 
                            headers: {'Content-Type': 'application/json'}
                        });

                        //  Save new tokens to Secure Store
                        await saveToken('accessToken', data.accessToken);
                        await saveToken('refreshToken', data.refreshToken);

                        //  If the original api is the logout api or the delete profile api, update refreshToken parameter in the body
                        if (originalRequest.url === "/auth/logout" || (originalRequest === "/profile" && originalRequest.method === "delete")) {
                            originalRequest.data = { refreshToken: data.refreshToken };
                        }

                        return data.accessToken;
                    } catch {
                        //  Delete both access and refresh token from Secure Store
                        await deleteToken('accessToken');
                        await deleteToken('refreshToken');
                        
                        return null;
                    } finally {
                        refreshTokenPromise = null;
                    }
                })();
            }

            const newAccessToken = await refreshTokenPromise;
            if(!newAccessToken) return Promise.reject(error);
                    
            //  Retry original request using the new access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
        }
        
        return Promise.reject(error)
    }
);

export default axiosInstance;
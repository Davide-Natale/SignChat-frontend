import { isAxiosError } from "axios";
import React, { createContext, useState } from "react"

interface ErrorContextType {
    errMsg: string
    showErrMsg: boolean
    handleError: (error: unknown) => void
    clearErrMsg: () => void
}

export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [errMsg, setErrMsg] = useState("");
    const [showErrMsg, setShowErrMsg] = useState(false);
    
    const handleError = (error: unknown) => {
        if(isAxiosError(error)) {
            if(error.response) {
                setErrMsg(error.response.data.message);
            } else if(error.message === "Network Error") {
                setErrMsg("Response timed out. Please try again.");
            }
        } else {
            setErrMsg("Unknown error.");
        }

        setShowErrMsg(true);
    };

    const clearErrMsg = () => {
        setShowErrMsg(false);
        setErrMsg("");
    };

    return(
        <ErrorContext.Provider value={{ errMsg, showErrMsg, handleError, clearErrMsg }}>
            {children}
        </ErrorContext.Provider>
    );
};
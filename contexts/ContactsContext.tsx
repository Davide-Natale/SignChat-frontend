import contactsAPI from "@/api/contactsAPI";
import { Contact } from "@/types/Contact";
import React, { createContext, useContext, useState } from "react";
import { ErrorContext } from "./ErrorContext";

interface ContactsContextType {
    contacts: Contact[];
    fetchContacts: () => Promise<void>;
    clearContacts: () => void;
    fetchContact: (id: number) => Promise<Contact | null> 
}

export const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const errorContext = useContext(ErrorContext);

    const fetchContacts = async () => {
        try {
            errorContext?.clearErrMsg();
            const contacts = await contactsAPI.getContacts();
            setContacts(contacts);
        } catch (error) {
            errorContext?.handleError(error);
        } 
    };

    const clearContacts = () => { setContacts([]); }

    const fetchContact = async (id: number) => {
        try {
            errorContext?.clearErrMsg();
            const contact = await contactsAPI.getContact(id);
            return contact;
        } catch (error) {
            errorContext?.handleError(error);
            return null;
        }
    }

    return(
        <ContactsContext.Provider value={{ contacts, fetchContacts, clearContacts, fetchContact }}>
            {children}
        </ContactsContext.Provider>
    );
}
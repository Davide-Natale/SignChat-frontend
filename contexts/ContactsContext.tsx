import contactsAPI from "@/api/contactsAPI";
import { Contact } from "@/types/Contact";
import React, { createContext, useState } from "react";

interface ContactsContextType {
    contacts: Contact[];
    fetchContacts: () => Promise<void>;
}

export const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contacts, setContacts] = useState<Contact[]>([]);

    const fetchContacts = async () => {
        try {
            const contacts = await contactsAPI.getContacts();
            setContacts(contacts);
        } catch (error) {
            //  No need to do anything
        }
        
    };

    return(
        <ContactsContext.Provider value={{ contacts, fetchContacts }}>
            {children}
        </ContactsContext.Provider>
    );
}
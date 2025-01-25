import contactsAPI from "@/api/contactsAPI";
import { Contact } from "@/types/Contact";
import React, { createContext, useState } from "react";

interface ContactsContextType {
    contacts: Contact[];
    fetchContacts: () => Promise<void>;
    clearContacts: () => void;
    fetchContact: (id: number) => Promise<Contact | null> 
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

    const clearContacts = () => { setContacts([]); }

    const fetchContact = async (id: number) => {
        try {
            const contact = await contactsAPI.getContact(id);
            return contact;
        } catch (error) {
            //  No need to do anything
            return null;
        }
    }

    return(
        <ContactsContext.Provider value={{ contacts, fetchContacts, clearContacts, fetchContact }}>
            {children}
        </ContactsContext.Provider>
    );
}
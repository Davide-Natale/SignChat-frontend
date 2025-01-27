import { Contact } from "@/types/Contact";
import axiosInstance from "@/utils/axiosInstance";

async function getContacts(): Promise<Contact[]> {
    //  Call GET /api/contacts
    const { data } = await axiosInstance('/contacts');

    const contacts: Contact[] = data.contacts.map((contact: any) => (
        {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
            user: contact.user
        }
    ));

    return contacts;
}

async function getContact(id: number): Promise<Contact> {
    //  Call GET /api/contacts/:id
    const { data } = await axiosInstance(`/contacts/${id}`);

    const contact: Contact = {
        id: data.contact.id,
        firstName: data.contact.firstName,
        lastName: data.contact.lastName,
        phone: data.contact.phone,
        user: data.contact.user
    };

    return contact;
}

async function createContact(contact: Omit<Contact, 'id' | 'user'>): Promise<number> {
    //  Call POST /api/contacts
    const { data } = await axiosInstance({
        method: 'post',
        url: '/contacts',
        data: contact,
        headers: { 'Content-Type': 'application/json' }
    });

    return data.contact.id;
}

async function updateContact(contact: Omit<Contact, 'user'>) {
    const { id, ...contactData } = contact;

    //  Call PUT /api/contacts/:id
    await axiosInstance({
        method: 'put',
        url: `/contacts/${id}`,
        data: contactData,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function deleteContact(id: number) {
    //  Call DELETE /api/contacts/:id
    await axiosInstance({
        method: 'delete',
        url: `/contacts/${id}`
    });
}

async function syncContacts(
    newContacts: Omit<Contact, 'id' | 'user'>[], 
    updatedContacts: Omit<Contact, 'id' | 'user'>[], 
    deletedContacts: string[]
) {
    //  Call POST /api/contacts/sync
    await axiosInstance({
        method: 'post',
        url: '/contacts/sync',
        data: { newContacts, updatedContacts, deletedContacts },
        headers: { 'Content-Type': 'application/json' }
    });
}

const contactsAPI = { getContacts, getContact, createContact, updateContact, deleteContact, syncContacts };

export default contactsAPI;
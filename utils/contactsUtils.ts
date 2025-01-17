import { Contact } from "@/types/Contact";

export const processContacts = (contacts: Contact[]) => {
  const registeredContacts = contacts.filter(contact => contact.user !== null);
  const unregisteredContacts = contacts.filter(contact => contact.user === null);

  const groupedContacts = registeredContacts.reduce<Record<string, Contact[]>>((accumulator, contact) => {
    const letter = contact.firstName[0].toUpperCase();

    if(!accumulator[letter]) {
        accumulator[letter] = [];
    }
    
    accumulator[letter].push(contact);
    return accumulator;
  }, {});

  return { groupedContacts, unregisteredContacts };
};
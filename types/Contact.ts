export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string;
    user: {
        id: string,
        imageProfile: string | null
    } | null;
}
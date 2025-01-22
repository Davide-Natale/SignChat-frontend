export interface Contact {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string;
    user: {
        id: number,
        imageProfile: string | null
    } | null;
}
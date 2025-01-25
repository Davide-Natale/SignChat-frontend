export interface Contact {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string;
    user: {
        id: number,
        imageProfile: string | null
    } | null;
}
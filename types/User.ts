export interface User {
    firstName: string; 
    lastName: string;
    email: string;
    phone: string;
    imageProfile: string | null;
}

export type CustomUser = Omit<User, 'email'> & { id: number };
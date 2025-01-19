import { Contact } from "@/types/Contact";
import { User } from "@/types/User";
import dayjs from "dayjs";

export interface Call {
    id: number;
    phone: string;
    type: 'incoming' | 'outgoing';
    status: 'completed' | 'missed' | 'rejected' | 'unanswered';
    date: dayjs.Dayjs;
    duration: number;
    contact: Contact | null;
    user: (Omit<User, 'email'> & { id: number }) | null
}
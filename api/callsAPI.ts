import { Call } from "@/types/Call";
import axiosInstance from "@/utils/axiosInstance";
import dayjs from "dayjs";

interface Options {
    contactId?: number;
    userId?: number;
    limit?: number;
}

async function getCalls({ contactId, userId, limit }: Options = {}): Promise<Call[]> {
    //  Call GET /api/calls
    const { data } = await axiosInstance({
        url: '/calls',
        params: {
            contactId,
            userId,
            limit
        }
    });

    const calls: Call[] = data.calls.map((call: any) => (
        {
            id: call.id,
            phone: call.phone,
            type: call.type,
            status: call.status, 
            date: dayjs(call.date),
            duration: call.duration,
            contact: call.contact,
            user: call.user
        }
    ));

    return calls;
}

async function getCall(id: number): Promise<Call> {
    //  Call GET /api/calls/:id
    const { data } = await axiosInstance(`/calls/${id}`);

    const call: Call = {
        id: data.call.id,
        phone: data.call.phone,
        type: data.call.type,
        status: data.call.status,
        date: dayjs(data.call.date),
        duration: data.call.duration,
        contact: data.call.contact,
        user: data.call.user
    };

    return call;
}

async function deleteCalls(ids: number[]) {
    //  Call DELETE /api/calls/:id
    await axiosInstance({
        method: 'delete',
        url: '/calls',
        data: { ids },
        headers: { 'Content-Type': 'application/json' }
    });
}

const callsAPI = { getCalls, getCall, deleteCalls };

export default callsAPI;
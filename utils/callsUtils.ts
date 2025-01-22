
type Type = 'incoming' | 'outgoing';
type Status = 'completed' | 'missed' | 'rejected' | 'unanswered';

export function getCallDescription(type: Type, status: Status): string {
    const descriptions: Record<string, string> = {
        'incoming_completed': 'Incoming Video Call',
        'incoming_missed': 'Missed Video Call',
        'outgoing_completed': 'Outgoing Video Call',
        'outgoing_rejected': 'Rejected Video Call',
        'outgoing_unanswered': 'Unanswered Video Call'
    }

    return descriptions[`${type}_${status}`];
}

export function formatCallDuration(duration: number): string {
    if(duration < 0) {
        return "";
    }

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);

    if (parts.length === 3) {
        return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
    } else if (parts.length === 2) {
        return `${parts[0]} and ${parts[1]}`;
    } else {
        return parts[0];
    }
}

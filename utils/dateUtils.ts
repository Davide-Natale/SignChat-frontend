import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function formatDate(
    date: dayjs.Dayjs, 
    dateFormat: string = "DD/MM/YYYY", 
    showTimeForToday: boolean = true
): string {
    if (date.isToday()) {
        return showTimeForToday ? date.format("HH:mm") : 'Today';
    } 
    if (date.isYesterday()) {
        return "Yesterday";
    } 
    if (date.isAfter(dayjs().subtract(7, "day"))) {
        return date.format("dddd");
    } 
    return date.format(dateFormat);
}

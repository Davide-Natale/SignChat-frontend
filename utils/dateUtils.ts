import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localeData);

export function formatDate(date: dayjs.Dayjs): string {
    if (date.isToday()) {
        return date.format("HH:mm");
    } 
    if (date.isYesterday()) {
        return "Yesterday";
    } 
    if (date.isAfter(dayjs().subtract(7, "day"))) {
        return date.format("dddd");
    } 
    return date.format("DD/MM/YYYY");
}

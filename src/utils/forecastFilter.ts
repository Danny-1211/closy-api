// 過濾 OpenWeather forecast list，取得明天與後天的代表資料。
// 每天優先選 "00:00:00"（台灣時間 08:00）的項目；若不存在則取該日第一筆。
import { ForecastEntry } from '../types/gemini';

const getDateString = (dtTxt: string): string => dtTxt.split(' ')[0] || ''; // "YYYY-MM-DD"
const getTimeString = (dtTxt: string): string => dtTxt.split(' ')[1] || ''; // "HH:MM:SS"

export const filterForecastDays = (
    list: ForecastEntry[]
): { tomorrow: ForecastEntry; dayAfterTomorrow: ForecastEntry } => {
    const now = new Date();
    const tomorrowDate = new Date(now);
    tomorrowDate.setUTCDate(now.getUTCDate() + 1);
    const dayAfterDate = new Date(now);
    dayAfterDate.setUTCDate(now.getUTCDate() + 2);

    const toISO = (d: Date): string => d.toISOString().split('T')[0] || ''; // "YYYY-MM-DD"
    const tomorrowStr = toISO(tomorrowDate);
    const dayAfterStr = toISO(dayAfterDate);

    const pick = (dateStr: string): ForecastEntry => {
        const dayEntries = list.filter(e => getDateString(e.dt_txt) === dateStr);
        if (dayEntries.length === 0) {
            throw { statusCode: 500, message: `找不到 ${dateStr} 的天氣預報資料` };
        }
        return (
            dayEntries.find(e => getTimeString(e.dt_txt) === '00:00:00') ??
            dayEntries[0]!
        );
    };

    return {
        tomorrow: pick(tomorrowStr),
        dayAfterTomorrow: pick(dayAfterStr),
    };
};

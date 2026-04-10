import { DayWeather, FilteredForecast } from '../types/gemini';

function findDaySlot(times: Array<{ StartTime: string }>, dateStr: string): any {
  return (
    times.find(t => t.StartTime.startsWith(`${dateStr}T06:00:00`)) ??
    times.find(t => t.StartTime.startsWith(`${dateStr}T18:00:00`))
  );
}

export function filterForecast(weatherElements: any[]): FilteredForecast {
  const taiwanNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const toDateStr = (d: Date) => d.toISOString().split('T')[0];
  const todayStr = toDateStr(taiwanNow) || '';
  const tomorrowDate = new Date(taiwanNow);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  const tomorrowStr = toDateStr(tomorrowDate) || '';

  const tempEl = weatherElements.find(e => e.ElementName === '平均溫度');
  const wxEl = weatherElements.find(e => e.ElementName === '天氣現象');
  const descEl = weatherElements.find(e => e.ElementName === '天氣預報綜合描述');

  const buildDay = (dateStr: string): DayWeather => {
    const tempSlot = findDaySlot(tempEl.Time, dateStr);
    const wxSlot = findDaySlot(wxEl.Time, dateStr);
    const descSlot = findDaySlot(descEl.Time, dateStr);
    return {
      temperature: tempSlot?.ElementValue[0]?.Temperature ?? '',
      weather: wxSlot?.ElementValue[0]?.Weather ?? '',
      weatherCode: wxSlot?.ElementValue[0]?.WeatherCode ?? '',
      weatherDescription: descSlot?.ElementValue[0]?.WeatherDescription ?? '',
    };
  };

  return {
    today: buildDay(todayStr),
    tomorrow: buildDay(tomorrowStr),
  };
}

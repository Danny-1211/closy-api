// 取得 OpenWeatherApi 天氣資訊
import axios from 'axios';
import { config } from '../types/env';
import { Location } from '../types/user';
import { getCurrentLocation } from '../utils/getCurrentLocation';
import { filterForecast } from '../utils/forecastFilter';

// google geocoding 先用經緯度抓使用者地點
// 將地點回傳之後再打氣象局開放資料平台拿到一週的天氣資料
// 在抓今天, 明天的天氣資料

export const getWeather = async (location: Location | undefined | null) => {
    if (!location || location.latitude === null || location.longitude === null) {
        throw { statusCode: 404, message: '使用者位置資訊未找到' };
    }
    try {
        const weatherApiKey = config.OPENWEATHER_API_KEY;
        const currentlyCity = await getCurrentLocation(location.latitude, location.longitude);
        const now = new Date();
        const dayAfterDate = new Date(now);
        const currentDate = new Date(now);
        currentDate.setUTCDate(now.getUTCDate());
        dayAfterDate.setUTCDate(now.getUTCDate() + 3);
        const toISO = (d: Date): string => d.toISOString().split('.')[0] || '';
        const dayAfterStr = toISO(dayAfterDate);
        const currentDateStr = toISO(currentDate);

        const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=${weatherApiKey}&LocationName=${currentlyCity}&ElementName=${['平均溫度', '天氣預報綜合描述', '天氣現象']}&timeFrom=${currentDateStr}&timeTo=${dayAfterStr}&sort=time`;
        const response = await axios.get(url);
        return {
            wheatherDataSet: filterForecast(response.data['records']['Locations'][0]['Location'][0]['WeatherElement']),
            city: currentlyCity
        }
    } catch (err) {
        throw { statusCode: 500, message: '取得今天天氣資訊失敗' };
    }
}

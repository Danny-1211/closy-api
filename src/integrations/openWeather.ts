// 取得 OpenWeatherApi 天氣資訊
import axios from 'axios';
import { config } from '../types/env';
import { Location } from '../types/user';
import { filterForecastDays } from '../utils/forecastFilter';

export const getTodayWeather = async (location: Location | undefined | null) => {
    if (!location || location.latitude === null || location.longitude === null) {
        throw { statusCode: 404, message: '使用者位置資訊未找到' };
    }
    try {
        const weatherApiKey = config.OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${weatherApiKey}&units=metric&lang=zh_tw`;
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        throw { statusCode: 500, message: '取得今天天氣資訊失敗' };
    }
}

export const getForecastWeather = async (location: Location | undefined | null) => {
    if (!location || location.latitude === null || location.longitude === null) {
        throw { statusCode: 404, message: '使用者位置資訊未找到' };
    }
    try {
        const weatherApiKey = config.OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${weatherApiKey}&units=metric&lang=zh_tw`;
        const response = await axios.get(url);
        return filterForecastDays(response.data.list);
    } catch (err) {
        throw { statusCode: 500, message: '取得天氣資訊失敗' };
    }
}
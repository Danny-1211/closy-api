// 使用 Google Reverse Geocoding API 取得目前位置的城市名稱
import axios from 'axios';
import { config } from '../types/env';

export async function getCurrentLocation(latitude: number, longitude: number) {
    if (latitude === null || longitude === null) {
        throw { statusCode: 404, message: '使用者位置資訊未提供' };
    }
    try {
        const apiKey = config.GOOGLE_GEOCODING_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=zh-TW`;
        const response = await axios.get(url);
        const cityName = response.data.results[0].address_components.find((component: any) => component.types.includes('administrative_area_level_1'))?.long_name;
        return cityName;
    } catch (err) {
        throw { statusCode: 500, message: '取得目前位置失敗' };
    }
}
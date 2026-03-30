import { Style } from '../types/constants';
import { Occasion } from '../types/constants';
import { Color } from '../types/constants';

// 偏好設定-所有顏色選項
const COLORS_SET: Color[] = [
  {
    colorId: 'black',
    colorName: '深灰黑',
  },
  {
    colorId: 'white',
    colorName: '淺米白',
  },
  {
    colorId: 'gray',
    colorName: '中性灰',
  },
  {
    colorId: 'brown',
    colorName: '大地棕',
  },
  {
    colorId: 'yellow',
    colorName: '奶油黃',
  },
  {
    colorId: 'orange',
    colorName: '暖橘紅',
  },
  {
    colorId: 'pink',
    colorName: '粉桃紅',
  },
  {
    colorId: 'green',
    colorName: '自然綠',
  },
  {
    colorId: 'blue',
    colorName: '清爽藍',
  },
  {
    colorId: 'purple',
    colorName: '優雅紫',
  },
] as const;

// 偏好設定-所有場合選項
const OCCASIONS_SET: Occasion[] = [
  {
    occasionId: 'socialGathering',
    occasionName: '社交聚會',
  },
  {
    occasionId: 'campusCasual',
    occasionName: '校園休閒',
  },
  {
    occasionId: 'businessCasual',
    occasionName: '商務休閒',
  },
  {
    occasionId: 'professional',
    occasionName: '專業職場',
  },
] as const;

// 偏好設定-所有風格選項
const STYLES_SET: Style[] = [
  {
    styleId: 'simple',
    styleName: '簡約',
  },
  {
    styleId: 'street',
    styleName: '街頭',
  },
  {
    styleId: 'outdoor',
    styleName: '戶外',
  },
  {
    styleId: 'american',
    styleName: '美式',
  },
  {
    styleId: 'japanese',
    styleName: '日系',
  },
  {
    styleId: 'korean',
    styleName: '韓系',
  },
  {
    styleId: 'retro',
    styleName: '復古',
  },
  {
    styleId: 'city',
    styleName: '都會',
  },
  {
    styleId: 'sweety',
    styleName: '甜美',
  },
] as const;

// 使用者性別
const genderOptions = ['male', 'female'] as const;

export { STYLES_SET, OCCASIONS_SET, COLORS_SET, genderOptions };

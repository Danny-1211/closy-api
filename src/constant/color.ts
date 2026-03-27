import { Color } from '../types/constants';

const COLORS_SET: Color[] = [
    {
        colorId: 'black',
        colorName: '深灰黑'
    },
    {
        colorId: 'white',
        colorName: '淺米白'
    },
    {
        colorId: 'gray',
        colorName: '中性灰'
    },
    {
        colorId: 'brown',
        colorName: '大地棕'
    },
    {
        colorId: 'yellow',
        colorName: '奶油黃'
    },
    {
        colorId: 'orange',
        colorName: '暖橘紅'
    },
    {
        colorId: 'pink',
        colorName: '粉桃紅'
    },
    {
        colorId: 'green',
        colorName: '自然綠'
    },
    {
        colorId: 'blue',
        colorName: '清爽藍'
    },
    {
        colorId: 'purple',
        colorName: '優雅紫'
    }
] as const;

export { COLORS_SET }
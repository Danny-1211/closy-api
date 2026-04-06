import { Occasion, Color, Season, Category } from '../types/constants';

// 衣服屬性 - 色系
const CLOTHES_COLORS_SET: Color[] = [
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

// 衣服屬性 - 場合
const CLOTHES_OCCASIONS_SET: Occasion[] = [
    {
        occasionId: 'socialGathering',
        occasionName: '社交聚會'
    },
    {
        occasionId: 'campusCasual',
        occasionName: '校園休閒'
    },
    {
        occasionId: 'businessCasual',
        occasionName: '商務休閒'
    },
    {
        occasionId: 'professional',
        occasionName: '專業職場'
    },
] as const;

// 衣服屬性 - 季節
const CLOTHES_SEASONS_SET: Season[] = [
    {
        seasonId: 'spring',
        seasonName: '春季'
    },
    {
        seasonId: 'summer',
        seasonName: '夏季'
    },
    {
        seasonId: 'autumn',
        seasonName: '秋季'
    },
    {
        seasonId: 'winter',
        seasonName: '冬季'
    }
] as const;

// 衣服屬性 - 類別
const CLOTHES_CATEGORIES_SET: Category[] = [
    {
        categoryId: 'top',
        categoryName: '上衣'
    },
    {
        categoryId: 'bottom',
        categoryName: '褲子'
    },
    {
        categoryId: 'outerwear',
        categoryName: '外套'
    },
    {
        categoryId: 'shoes',
        categoryName: '鞋子'
    },
    {
        categoryId: 'skirt',
        categoryName: '裙子'
    },
    {
        categoryId: 'dress',
        categoryName: '連身裙'
    }
] as const;

export { CLOTHES_COLORS_SET, CLOTHES_OCCASIONS_SET, CLOTHES_SEASONS_SET, CLOTHES_CATEGORIES_SET }

import { Style } from '../types/constants';

// 偏好設定-所有風格選項
const STYLES_SET: Style[] = [
    {
        styleId: 'simple',
        styleName: '簡約'
    },
    {
        styleId: 'street',
        styleName: '街頭'
    },
    {
        styleId: 'outdoor',
        styleName: '戶外'
    },
    {
        styleId: 'american',
        styleName: '美式'
    },
    {
        styleId: 'japanese',
        styleName: '日系'
    },
    {
        styleId: 'korean',
        styleName: '韓系'
    },
    {
        styleId: 'retro',
        styleName: '復古'
    },
    {
        styleId: 'city',
        styleName: '都會'
    },
    {
        styleId: 'sweety',
        styleName: '甜美'
    }
] as const;

export { STYLES_SET }
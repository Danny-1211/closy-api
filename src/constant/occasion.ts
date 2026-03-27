import { Occasion } from '../types/constants';

const OCCASIONS_SET: Occasion[] = [
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

export { OCCASIONS_SET }
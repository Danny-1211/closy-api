import express from 'express';
import { authMiddleWare } from '../../middlewares/tokenCheckMiddle';
import { errorHandler } from '../../utils/errorMessage';
import { generateOutfitRecommendation } from '../../services/geminiServices';
import { OutfitContext } from '../../types/gemini';

const homeRouter = express.Router();

homeRouter.get('/today', authMiddleWare, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const context: OutfitContext = {
            gender: req.user!.gender,
            occasion: {
                occasionId: 'socialGathering',
                occasionName: '社交聚會'
            },
            styles: ['簡約', '日系'],
            colors: ['深灰黑', '大地棕', '奶油黃']
        }
        const result = await generateOutfitRecommendation(context);
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message: '取得穿搭建議成功',
            ok: true,
            data: {
                reuslt: result
            },
        });
    } catch (err) {
        return errorHandler(err as { statusCode: number; message: string }, res);
    }
});

export { homeRouter }
// 擴充 Express Request 型別，加入 JWT verify 後的使用者資訊
import { JwtPayload } from 'jsonwebtoken';
export interface UserPayload extends JwtPayload {
  userId: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

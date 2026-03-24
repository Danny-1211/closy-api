import { User } from '../models/user';

export const updateUserGender = async (userId: string, gender: string) => {
    // 根據你的 Mongoose Model，將使用者的性別做更新
    // { new: true } 讓 Mongoose 回傳的是修改「後」的最新資料
    const user = await User.findByIdAndUpdate(
        userId,
        { gender },
        { new: true }
    );

    if (!user) {
        throw new Error('找不到該使用者');
    }

    return user;
};

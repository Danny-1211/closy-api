import { User } from '../models/user';

export const updateUserGender = async (userId: string, gender: string) => {
    try {
        // Mongoose 將使用者的性別做更新
        const user = await User.findByIdAndUpdate(
            userId,
            { gender },
            { new: true }
        );

        if (!user) {
            return false;
        }

        return user;
    } catch (error) {
        return false;
    }
};

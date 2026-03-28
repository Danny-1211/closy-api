import { User } from '../models/user';

export const updateUserGender = async (userId: string, gender: string) => {
    // 將使用者的性別做更新
    const user = await User.findByIdAndUpdate(
        userId,
        { gender },
        { new: true }
    );
    return user;
}

export const updateUserColor = async (userId: string, colors: string[]) => {
    // 將使用者的色系偏好做更新
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { 'preferences.colors': colors } },
        { new: true }
    );
    return user;
}

export const updateUserStyle = async (userId: string, styles: string[]) => {
    // 將使用者的風格偏好做更新
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { 'preferences.styles': styles } },
        { new: true }
    );
    return user;
}

export const updateUserOccasion = async (userId: string, occasions: string) => {
    // 將使用者的場合偏好做更新
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { 'preferences.occasions': occasions } },
        { new: true }
    );
    return user;
}


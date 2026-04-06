import { User } from '../models/user';

export const getUserInformation = async (userId: string) => {
  // 取得使用者的資訊
  const user = await User.findById(userId);
  return user;
}

export const updateUserGender = async (userId: string, gender: string) => {
  // 將使用者的性別做更新
  const user = await User.findByIdAndUpdate(
    userId,
    { gender },
    { returnDocument: 'after' }
  );
  return user;
};

export const updateUserColor = async (userId: string, colors: string[]) => {
  // 將使用者的色系偏好做更新
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'preferences.colors': colors } },
    { returnDocument: 'after' },
  );
  return user;
};

export const updateUserStyle = async (userId: string, styles: string[]) => {
  // 將使用者的風格偏好做更新
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'preferences.styles': styles } },
    { returnDocument: 'after' },
  );
  return user;
};

export const updateUserOccasion = async (userId: string, occasions: string) => {
  // 將使用者的場合偏好做更新
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'preferences.occasions': occasions } },
    { returnDocument: 'after' },
  );
  return user;
};

export const updateUserLocation = async (userId: string, longitude: number, latitude: number) => {
  // 將使用者的位置做更新
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'location.longitude': longitude, 'location.latitude': latitude } },
    { returnDocument: 'after' },
  )
  return user;
}
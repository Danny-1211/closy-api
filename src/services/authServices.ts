import { User } from '../models/user';
import { signToken } from '../utils/jwt';
import { verifyGoogleToken } from '../integrations/auth';
// 查找或建立用戶
async function findOrCreateUser({
  googleId,
  email,
  picture,
  name,
}: {
  googleId: string;
  email?: string;
  picture?: string;
  name?: string;
}) {
  const user = await User.findOne({ googleId });

  // 如果已經被創過
  if (user) {
    return user;
  }

  const newUser = new User({
    googleId: googleId || '',
    email: email || '',
    name: name || '',
    picture: picture || '',
    preferences: {
      styles: [],
      colors: [],
      occasions: '',
    },
  });

  // 儲存新用戶到 DB
  await newUser.save();
  return newUser;
}

export const loginWithGoogle = async (id_token: string) => {
  const payload = await verifyGoogleToken(id_token);

  if (!payload) {
    throw Object.assign(new Error('unvalid Google Token'), { statusCode: 401 });
  }

  const user = await findOrCreateUser({
    googleId: payload.sub,
    email: payload.email,
    picture: payload.picture,
    name: payload.name,
  });

  if (!user) {
    throw Object.assign(new Error('user create failed'), { statusCode: 500 });
  }

  const token = signToken(user.id);
  return { token, user };
};

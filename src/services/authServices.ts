import { OAuth2Client } from 'google-auth-library';
import { config } from '../types/env';
import { User } from '../models/user';
import { signToken } from '../utils/jwt';

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

// 向 Google 驗證 id_token
const verifyGoogleToken = async (id_token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: config.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

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
      occasions: [],
    }
  });

  // 儲存新用戶到 DB
  await newUser.save();
  return newUser;
}

export const loginWithGoogle = async (id_token: string) => {
  const payload = await verifyGoogleToken(id_token);

  if (!payload) throw new Error('unvalid Google Token');

  const user = await findOrCreateUser({
    googleId: payload.sub,
    email: payload.email,
    picture: payload.picture,
    name: payload.name,
  });

  if (!user) throw new Error('user create failed');

  const token = signToken(user.id);
  return { token, user };
};

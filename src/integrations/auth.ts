import { OAuth2Client } from 'google-auth-library';
import { config } from '../types/env';

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

// 向 Google 驗證 id_token
export const verifyGoogleToken = async (id_token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: config.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

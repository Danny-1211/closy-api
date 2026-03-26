import { Preferences } from './preference';

type Location = {
  latitude: number | null;
  longtitude: number | null;
};

type User = {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  gender: string;
  preferences: Preferences;
  location: Location;
  createdAt?: Date;
  updatedAt?: Date;
};

export { Location, Preferences, User };

type Preferences = {
  styles: string[];
  colors: string[];
  occasions: string;
};

type Location = {
  latitude: number | null;
  longitude: number | null;
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

type Location = {
    latitude: number | null;
    longtitude: number | null;
}

type Preferences = {
    styles: [string] | [];
    colors: [string] | [];
    occasions: [string] | [];
}

type User = {
    googleId: string | '',
    email: string | '',
    name: string | '',
    picture: string | '',
    gender: string | '',
    preferences: Preferences | { styles: [], colors: [], occasions: [] },
    location: Location | { latitude: null, longtitude: null },
    createdAt?: Date;
    updatedAt?: Date;
}

export {
    Location,
    Preferences,
    User
}
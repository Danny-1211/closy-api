type singleItem = {
  category: string;
  cloudImgUrl: string;
  imageHash: string;
  name: string;
  color: string;
  occasions: string[];
  seasons: string[];
  brand: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type Clothes = {
  userId: string;
  list: singleItem[];
  pagination: object;
  createdAt: Date;
  updatedAt: Date;
};

export { Clothes, singleItem };
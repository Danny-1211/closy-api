type singleItem = {
  toObject(): any;
  category: string;
  cloudImgUrl: string;
  imageHash: string;
  name: string;
  color: string;
  occasions: string[];
  seasons: string[];
  brand: string;
};

type Clothes = {
  userId: string;
  list: singleItem[];
  pagination: object;
  createdAt: Date;
  updatedAt: Date;
};

export { Clothes, singleItem };
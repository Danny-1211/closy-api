
type Style = {
  styleId: string;
  styleNameEn: string;
  styleNameCh: string;
  styleImg: string;
};

type Color = {
  colorId: string;
  colorNameEn: string;
  colorNameCh: string;
};

type Occasion = {
  occasionId: string;
  occasionNameEn: string;
  occasionNameCh: string;
  occasionDescription: string;
  occasionImg: string;
};

type Preferences = {
  styles: Style[];
  colors: Color[];
  occasions: Occasion[];
};

export { Preferences };

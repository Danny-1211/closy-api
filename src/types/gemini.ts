export type OutfitContext = {
  gender: string;
  occasion: { occasionId: string; occasionName: string };
  styles: string[];
  colors: string[];
};

export type GeminiOutfitResponse = {
  selectedItemIds: string[];
  reasoning: string;
};

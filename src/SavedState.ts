import { BingoItemCategory } from "./BingoBoard";

export default interface SavedCard {
  stateKey: string;
  data: SavedCardItem[][];
}

export interface SavedCardItem {
  name: string;
  description: string;
  category: BingoItemCategory;
  state: boolean;
}

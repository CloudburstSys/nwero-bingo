export default interface SavedState {
  expiry: Date;
  card: SavedCard;
}

export interface SavedCard {
  name: string;
  width: number;
  height: number;
  freeSpaces: (CardFreeSpace | CardFreeSpaces)[];
  state: SavedStateItem[][];
}

export interface CardFreeSpaces {
  type: "multiple";
  pos: [number, number];
  mode: "theme" | "random";
  freeSpaces: CardFreeSpace[];
}

export interface CardFreeSpace {
  type: "single";
  pos: [number, number];
  src: string;
  alt: string;
  credit: {
    name: string;
    source: string;
  };
  stretch?: boolean;
}

export interface SavedStateItem {
  name: string;
  description: string;
  marked: boolean;
}

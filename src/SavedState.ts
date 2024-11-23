export default interface SavedState {
  expiry: Date;
  card: SavedCard;
}

export interface SavedCard {
  name: string;
  description: string | undefined;
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
  srcMarked?: string;
  alt: string;
  credit: {
    name: string;
    source: string;
  };
  stretch?: boolean;
  description?: string;
  reminderOverride?: string;
}

export interface SavedStateItem {
  name: string;
  description: string;
  marked: boolean;
}

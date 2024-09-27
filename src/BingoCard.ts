import Emote from "./Emote";
import * as Modal from "./Modal";
import SavedState, { CardFreeSpace, CardFreeSpaces, SavedCard } from "./SavedState";
import { onClassChange } from "./Utils";

/* Assembles a Bingo card */
export default class BingoCard {
  public name: string;
  public width: number;
  public height: number;
  public data: BingoCardItem[][];

  constructor(name: string, width: number, height: number, boardData?: BingoCardItem[][]) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.data =
      boardData ||
      (() => {
        // No data provided, generate an empty bingo card filled with BingoCardEmptyItems
        let output: BingoCardItem[][] = [];
        for (let h = 0; h < this.height; h++) {
          output[h] = [];
          for (let w = 0; w < this.width; w++) {
            output[h][w] = new BingoCardEmptyItem();
          }
        }
        return output;
      })();
  }

  static fromSavedState(state: SavedState) {
    let card = new this(
      state.card.name,
      state.card.width,
      state.card.height,
      state.card.state.map((row) => row.map((item) => new BingoCardItem(item.name, item.description, item.marked))),
    );
    state.card.freeSpaces.forEach((freeSpace) => {
      if (freeSpace.type === "multiple") {
        let space = new BingoCardMultipleFreeSpaces(freeSpace.mode, freeSpace.freeSpaces.map(freeSpace => new BingoCardFreeSpace(
          freeSpace.src,
          freeSpace.alt,
          freeSpace.credit.name,
          freeSpace.credit.source,
          freeSpace.stretch
        )));

        space.update(document.body.classList.contains("dark") ? "dark" : "light");
        onClassChange(document.body, (body) => {
          (space as BingoCardMultipleFreeSpaces).update(body.classList.contains("dark") ? "dark" : "light");
        });

        card.setItem(
          freeSpace.pos[0],
          freeSpace.pos[1],
          space
        );
      } else {
        card.setItem(
          freeSpace.pos[0],
          freeSpace.pos[1],
          new BingoCardFreeSpace(freeSpace.src, freeSpace.alt, freeSpace.credit.name, freeSpace.credit.source),
        );
      }
    });

    return card;
  }

  setItem(row: number, column: number, item: BingoCardItem) {
    this.data[row][column] = item;
  }

  clearItem(row: number, column: number) {
    this.data[row][column] = new BingoCardEmptyItem();
  }

  render(element: HTMLElement) {
    // element is the container
    for (let i = 0; i < this.data.length; i++) {
      let row = this.data[i];
      let rowElement = document.createElement("div");
      rowElement.classList.add("bingo-row");
      element.appendChild(rowElement);
      for (let j = 0; j < row.length; j++) {
        if (i == 0 && j == 0) row[j].addTopLeftCurve(30);
        if (i == 0 && j == (this.width - 1)) row[j].addTopRightCurve(30);
        if (i == (this.height - 1) && j == 0) row[j].addBottomLeftCurve(30);
        if (i == (this.height - 1) && j == (this.width - 1)) row[j].addBottomRightCurve(30);

        row[j].render(rowElement);
      }
    }
  }

  toJSON(): SavedCard {
    let freeSpaces: (CardFreeSpace | CardFreeSpaces)[] = [];

    for (let row = 0; row < this.data.length; row++) {
      for (let column = 0; column < this.data[row].length; column++) {
        if (this.data[row][column] instanceof BingoCardFreeSpace) {
          freeSpaces.push({
            type: "single",
            pos: [row, column],
            src: (this.data[row][column] as BingoCardFreeSpace).imageUrl,
            alt: (this.data[row][column] as BingoCardFreeSpace).altText,
            credit: {
              name: (this.data[row][column] as BingoCardFreeSpace).artistName,
              source: (this.data[row][column] as BingoCardFreeSpace).sourceUrl,
            },
            stretch: (this.data[row][column] as BingoCardFreeSpace).stretched
          });
        } else if (this.data[row][column] instanceof BingoCardMultipleFreeSpaces) {
          freeSpaces.push({
            type: "multiple",
            pos: [row, column],
            mode: (this.data[row][column] as BingoCardMultipleFreeSpaces).mode,
            freeSpaces: (this.data[row][column] as BingoCardMultipleFreeSpaces).freeSpaces.map(freeSpace => {
              return {
                type: "single",
                pos: [row, column],
                src: freeSpace.imageUrl,
                alt: freeSpace.altText,
                credit: {
                  name: freeSpace.artistName,
                  source: freeSpace.sourceUrl
                },
                stretch: freeSpace.stretched
              }
            })
          });
        }
      }
    }

    return {
      name: this.name,
      width: this.width,
      height: this.height,
      freeSpaces: freeSpaces,
      state: this.data.map((row) =>
        row.map((item) => {
          return {
            name: item.name,
            description: item.description,
            marked: item.marked,
          };
        }),
      ),
    };
  }
}

export class BingoCardItem {
  public name: string;
  public description: string;
  public marked: boolean;
  public togglable: boolean;
  protected element: HTMLElement;
  private longHoldTimeout: number | undefined = undefined;

  constructor(name: string, description: string, marked: boolean = false, togglable: boolean = true) {
    this.name = name;
    this.description = description;
    this.marked = marked;
    this.togglable = togglable;

    this.element = this._render();
  }

  protected _render() {
    let element = document.createElement("div");
    element.classList.add("bingo-item");
    if (this.marked) element.classList.add("active");

    let textElement = document.createElement("span");
    Emote.convert(this.name).then((str) => (textElement.innerHTML = str));
    element.appendChild(textElement);

    element.addEventListener("mousedown", (e: MouseEvent) => this.onClick(e));
    element.addEventListener("touchstart", (e: TouchEvent) => {
      this.longHoldTimeout = setTimeout(() => this.onLongHold(e), 500) as unknown as number;
    });
    element.addEventListener("touchend", () => clearTimeout(this.longHoldTimeout));
    element.addEventListener("touchmove", () => clearTimeout(this.longHoldTimeout));

    return element;
  }

  static fromBoardJSON(data: { name: string; description: string }): BingoCardItem {
    return new this(data?.name, data?.description);
  }

  addTopLeftCurve(value: number) {
    this.element.style.borderTopLeftRadius = `${value}px`;
  }
  addTopRightCurve(value: number) {
    this.element.style.borderTopRightRadius = `${value}px`;
  }
  addBottomLeftCurve(value: number) {
    this.element.style.borderBottomLeftRadius = `${value}px`;
  }
  addBottomRightCurve(value: number) {
    this.element.style.borderBottomRightRadius = `${value}px`;
  }

  render(element: HTMLElement) {
    element.appendChild(this.element);
  }

  private onLongHold(e: TouchEvent) {
    Modal.showModal(this.name, this.description);
  }

  private onClick(e: MouseEvent) {
    if (e.which === 3 || e.button === 2) {
      Modal.showModal(this.name, this.description);
    } else if (e.which === 1 || e.button === 0) {
      if (!this.togglable) return;
      this.marked = !this.marked;
      if (this.marked) this.element.classList.add("active");
      else this.element.classList.remove("active");
    }
  }
}

/**
 * An extension of BingoCardItem used for free spaces.
 */
export class BingoCardFreeSpace extends BingoCardItem {
  public imageUrl: string;
  public altText: string;
  public artistName: string;
  public sourceUrl: string;
  public stretched: boolean;

  constructor(imageUrl: string, altText: string, artistName: string, sourceUrl: string, streched: boolean = false) {
    super(
      "Free Space",
      `the stream starts (selected automatically)<br/><img class="modal-image" src="${imageUrl}" alt="${altText}" /><br/>Art credit: <a href="${sourceUrl}" target="_blank">${artistName}</a>`,
      true,
      false,
    );

    this.imageUrl = imageUrl;
    this.altText = altText;
    this.artistName = artistName;
    this.sourceUrl = sourceUrl;
    this.stretched = streched;

    this.element.innerHTML = `<img class="bingo-image${this.stretched ? " stretch" : ""}" src="${this.imageUrl}" alt="${this.altText}" />`;
  }
}

export class BingoCardMultipleFreeSpaces extends BingoCardItem {
  public mode: "theme" | "random";
  public freeSpaces: BingoCardFreeSpace[];

  constructor(mode: "theme" | "random", freeSpaces: BingoCardFreeSpace[]) {
    super(
      "Multiple Free Space",
      `the stream starts (selected automatically)<br/><br/>This should have changed ${mode === "random" ? "randomly": "in accordance with the theme"} but something went wrong.`,
      true,
      false
    );

    this.mode = mode;
    this.freeSpaces = freeSpaces;
  }

  update(theme?: "light" | "dark") {
    if (this.mode === "theme") {
      if (theme === "light") {
        this.name = this.freeSpaces[0].name;
        this.description = this.freeSpaces[0].description;
        this.element.innerHTML = `<img class="bingo-image${this.freeSpaces[0].stretched ? " stretch" : ""}" src="${this.freeSpaces[0].imageUrl}" alt="${this.freeSpaces[0].altText}" />`;
        
        document.getElementById("bingo-artwork-credit-below")!.innerHTML =
          `Center artwork credit: <a href="${this.freeSpaces[0].sourceUrl}" target="_blank">${this.freeSpaces[0].artistName}</a>`;
      } else {
        this.name = this.freeSpaces[1].name;
        this.description = this.freeSpaces[1].description;
        this.element.innerHTML = `<img class="bingo-image${this.freeSpaces[1].stretched ? " stretch" : ""}" src="${this.freeSpaces[1].imageUrl}" alt="${this.freeSpaces[1].altText}" />`;

        document.getElementById("bingo-artwork-credit-below")!.innerHTML =
          `Center artwork credit: <a href="${this.freeSpaces[1].sourceUrl}" target="_blank">${this.freeSpaces[1].artistName}</a>`;
      }
    } else {
      let randomFreeSpace = this.freeSpaces[Math.floor(Math.random() * this.freeSpaces.length)];

      this.name = randomFreeSpace.name;
      this.description = randomFreeSpace.description;
      this.element.innerHTML = `<img class="bingo-image${randomFreeSpace.stretched ? " stretch" : ""}" src="${randomFreeSpace.imageUrl}" alt="${randomFreeSpace.altText}" />`;

      document.getElementById("bingo-artwork-credit-below")!.innerHTML =
      `Center artwork credit: <a href="${randomFreeSpace.sourceUrl}" target="_blank">${randomFreeSpace.artistName}</a>`;
    }
  }
}

export class BingoCardEmptyItem extends BingoCardItem {
  constructor() {
    super("", "never", false, false);
  }
}

import Emote from "./Emote";
import * as Modal from "./Modal";
import SavedState, { CardFreeSpace, CardFreeSpaces, SavedCard } from "./SavedState";
import { onClassChange } from "./Utils";
import detectBingo from "./BingoDetector";

/* Assembles a Bingo card */
export default class BingoCard {
  public name: string;
  public description: string | undefined;
  public width: number;
  public height: number;
  public data: BingoCardItem[][];

  constructor(name: string, description: string | undefined, width: number, height: number, boardData?: BingoCardItem[][]) {
    this.name = name;
    this.description = description;
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
            let item = new BingoCardEmptyItem();
            item.addToggleListener((state: boolean) => detectBingo(w, h, state, this));
            output[h][w] = item;
          }
        }
        return output;
      })();
  }

  static fromSavedState(state: SavedState) {
    let card = new this(
      state.card.name,
      state.card.description,
      state.card.width,
      state.card.height,
      state.card.state.map((row) => row.map((item) => new BingoCardItem(item.name, item.description, item.marked))),
    );
    for (let y = 0; y < card.data.length; y++) {
      for (let x = 0; x < card.data[y].length; x++) {
        card.data[y][x].addToggleListener((state: boolean) => detectBingo(x, y, state, card));
        detectBingo(x, y, card.data[y][x].marked, card);
      }
    }
    state.card.freeSpaces.forEach((freeSpace) => {
      if (freeSpace.type === "multiple") {
        let space = new BingoCardMultipleFreeSpaces(
          freeSpace.mode,
          freeSpace.freeSpaces.map(
            (freeSpace) =>
              new BingoCardFreeSpace(
                freeSpace.src,
                freeSpace.srcMarked,
                freeSpace.useMarkedAsReal,
                freeSpace.alt,
                freeSpace.credit.name,
                freeSpace.credit.source,
                freeSpace.description,
                freeSpace.reminderOverride,
                freeSpace.stretch,
              ),
          ),
        );

        space.marked = state.card.state[freeSpace.pos[0]][freeSpace.pos[1]].marked;

        space.update(false, document.body.classList.contains("dark") ? "dark" : "light");
        onClassChange(document.body, (body) => {
          (space as BingoCardMultipleFreeSpaces).update(false, body.classList.contains("dark") ? "dark" : "light");
        });

        card.setItem(freeSpace.pos[0], freeSpace.pos[1], space);
      } else {
        let fs = new BingoCardFreeSpace(freeSpace.src, freeSpace.srcMarked, freeSpace.useMarkedAsReal, freeSpace.alt, freeSpace.credit.name, freeSpace.credit.source, freeSpace.description, freeSpace.reminderOverride, freeSpace.stretch);
        let currentState = state.card.state[freeSpace.pos[0]][freeSpace.pos[1]].marked;

        fs.marked = currentState;
        fs.onToggle(currentState);

        card.setItem(
          freeSpace.pos[0],
          freeSpace.pos[1],
          fs
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
        if (i == 0 && j == this.width - 1) row[j].addTopRightCurve(30);
        if (i == this.height - 1 && j == 0) row[j].addBottomLeftCurve(30);
        if (i == this.height - 1 && j == this.width - 1) row[j].addBottomRightCurve(30);

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
            srcMarked: (this.data[row][column] as BingoCardFreeSpace).markedImageUrl,
            useMarkedAsReal: (this.data[row][column] as BingoCardFreeSpace).useMarkedAsReal ? true : undefined,
            alt: (this.data[row][column] as BingoCardFreeSpace).altText,
            credit: {
              name: (this.data[row][column] as BingoCardFreeSpace).artistName,
              source: (this.data[row][column] as BingoCardFreeSpace).sourceUrl,
            },
            description: (this.data[row][column] as BingoCardFreeSpace).overriddenDescription,
            reminderOverride: (this.data[row][column] as BingoCardFreeSpace).overriddenReminder,
            stretch: (this.data[row][column] as BingoCardFreeSpace).stretched,
          });
        } else if (this.data[row][column] instanceof BingoCardMultipleFreeSpaces) {
          freeSpaces.push({
            type: "multiple",
            pos: [row, column],
            mode: (this.data[row][column] as BingoCardMultipleFreeSpaces).mode,
            freeSpaces: (this.data[row][column] as BingoCardMultipleFreeSpaces).freeSpaces.map((freeSpace) => {
              return {
                type: "single",
                pos: [row, column],
                src: freeSpace.imageUrl,
                srcMarked: freeSpace.markedImageUrl,
                useMarkedAsReal: freeSpace.useMarkedAsReal ? true : undefined,
                alt: freeSpace.altText,
                credit: {
                  name: freeSpace.artistName,
                  source: freeSpace.sourceUrl,
                },
                description: freeSpace.overriddenDescription,
                reminderOverride: freeSpace.overriddenReminder,
                stretch: freeSpace.stretched,
              };
            }),
          });
        }
      }
    }

    return {
      name: this.name,
      description: this.description,
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
  public overriddenReminder: string | undefined;
  protected element: HTMLElement;
  private longHoldTimeout: number | undefined = undefined;
  private listeners: Function[] = [];

  constructor(name: string, description: string, marked: boolean = false, togglable: boolean = true, overriddenReminder?: string) {
    this.name = name;
    this.description = description;
    this.marked = marked;
    this.togglable = togglable;
    this.overriddenReminder = overriddenReminder;

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

  addClass(name: string) {
    this.element.classList.add(name);
  }

  removeClass(name: string) {
    this.element.classList.remove(name);
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

  public update(fakeNoMark?: boolean) {
    if (this.marked && !fakeNoMark)
      this.element.classList.add("active");
    else this.element.classList.remove("active");
  }

  render(element: HTMLElement) {
    element.appendChild(this.element);
  }

  private onLongHold(e: TouchEvent) {
    Modal.showModal(this.name, this.description, this.overriddenReminder);
  }

  public addToggleListener(callback: Function): void {
    this.listeners.push(callback);
  };

  protected onClick(e: MouseEvent) {
    if (e.which === 3 || e.button === 2) {
      Modal.showModal(this.name, this.description, this.overriddenReminder);
    } else if (e.which === 1 || e.button === 0) {
      if (!this.togglable) return;
      this.marked = !this.marked;
      if (this.marked) this.element.classList.add("active");
      else this.element.classList.remove("active");
      console.log("a");
      this.listeners.forEach(listener => listener(this.marked));
    }
  }
}

/**
 * An extension of BingoCardItem used for free spaces.
 */
export class BingoCardFreeSpace extends BingoCardItem {
  public imageUrl: string;
  public markedImageUrl: string | undefined;
  public useMarkedAsReal: boolean;
  public altText: string;
  public artistName: string;
  public sourceUrl: string;
  public stretched: boolean;
  public overriddenDescription: string | undefined;

  constructor(imageUrl: string, markedImageUrl: string | undefined, useMarkedAsReal: boolean | undefined, altText: string, artistName: string, sourceUrl: string, overriddenDescription: string | undefined = undefined, overriddenReminder: string | undefined = undefined, streched: boolean = false) {
    super(
      "Free Space",
      `${(overriddenDescription ? overriddenDescription : "the stream starts")}<br/><img class="modal-image" src="${useMarkedAsReal ? markedImageUrl : imageUrl}" alt="${altText}" /><br/>Art credit: <a href="${sourceUrl}" target="_blank">${artistName}</a>`,
      false,
      true,
      overriddenReminder
    );

    this.imageUrl = imageUrl;
    this.markedImageUrl = markedImageUrl;
    this.useMarkedAsReal = useMarkedAsReal || false;
    this.altText = altText;
    this.artistName = artistName;
    this.sourceUrl = sourceUrl;
    this.stretched = streched;
    this.overriddenDescription = overriddenDescription;

    this.element.innerHTML = `<img class="bingo-image${this.stretched ? " stretch" : ""}" src="${this.imageUrl}" alt="${this.altText}" />`;
  }

  public onToggle(state: boolean) {
    console.log(state);
    if (state)
      (this.element.querySelector(".bingo-image") as HTMLImageElement).src = this.markedImageUrl || this.imageUrl;
    else
      (this.element.querySelector(".bingo-image") as HTMLImageElement).src = this.imageUrl;
  }
}

export class BingoCardMultipleFreeSpaces extends BingoCardItem {
  public mode: "theme" | "random";
  private theme: "light" | "dark" = "light";
  public freeSpaces: BingoCardFreeSpace[];

  constructor(mode: "theme" | "random", freeSpaces: BingoCardFreeSpace[]) {
    super(
      "Multiple Free Space",
      `the stream starts<br/><br/>This should have changed ${mode === "random" ? "randomly" : "in accordance with the theme"} but something went wrong.`,
      false,
      true,
    );

    this.mode = mode;
    this.freeSpaces = freeSpaces;
  }

  update(fakeNoMark?: boolean, theme?: "light" | "dark") {
    if (this.mode === "theme") {
      if (theme === "light") {
        this.theme = "light";
        this.name = this.freeSpaces[0].name;
        this.description = this.freeSpaces[0].description;
        this.element.innerHTML = `<img class="bingo-image${this.freeSpaces[0].stretched ? " stretch" : ""}" src="${this.freeSpaces[0].imageUrl}" alt="${this.freeSpaces[0].altText}" />`;

        //document.getElementById("bingo-artwork-credit-below")!.innerHTML =
        //`Center artwork credit: <a href="${this.freeSpaces[0].sourceUrl}" target="_blank">${this.freeSpaces[0].artistName}</a>`;
      } else {
        this.theme = "dark";
        this.name = this.freeSpaces[1].name;
        this.description = this.freeSpaces[1].description;
        this.element.innerHTML = `<img class="bingo-image${this.freeSpaces[1].stretched ? " stretch" : ""}" src="${this.freeSpaces[1].imageUrl}" alt="${this.freeSpaces[1].altText}" />`;

        //document.getElementById("bingo-artwork-credit-below")!.innerHTML =
        //`Center artwork credit: <a href="${this.freeSpaces[1].sourceUrl}" target="_blank">${this.freeSpaces[1].artistName}</a>`;
      }
    } else {
      let randomFreeSpace = this.freeSpaces[Math.floor(Math.random() * this.freeSpaces.length)];

      this.name = randomFreeSpace.name;
      this.description = randomFreeSpace.description;
      this.element.innerHTML = `<img class="bingo-image${randomFreeSpace.stretched ? " stretch" : ""}" src="${randomFreeSpace.imageUrl}" alt="${randomFreeSpace.altText}" />`;

      //document.getElementById("bingo-artwork-credit-below")!.innerHTML =
      //`Center artwork credit: <a href="${randomFreeSpace.sourceUrl}" target="_blank">${randomFreeSpace.artistName}</a>`;
    }

    if (this.marked && !fakeNoMark)
      this.element.classList.add("active");
    else this.element.classList.remove("active");

    this.onToggle(this.marked);
  }

  public onToggle(state: boolean) {
    console.log(state);
    if (this.mode === "theme") {
      if (this.theme === "light") {
        if (state)
          (this.element.querySelector(".bingo-image") as HTMLImageElement).src = this.freeSpaces[0].markedImageUrl || this.freeSpaces[0].imageUrl;
        else
          (this.element.querySelector(".bingo-image") as HTMLImageElement).src = this.freeSpaces[0].imageUrl;
      } else {
        if (state)
          (this.element.querySelector(".bingo-image") as HTMLImageElement).src = this.freeSpaces[1].markedImageUrl || this.freeSpaces[1].imageUrl;
        else
          (this.element.querySelector(".bingo-image") as HTMLImageElement).src = this.freeSpaces[1].imageUrl;
      }
    } else {
      // TODO: Make this work!
    }
  }
}

export class BingoCardEmptyItem extends BingoCardItem {
  constructor() {
    super("", "never", false, false);
  }
}

import "./index.scss";

import BingoCard, { BingoCardFreeSpace, BingoCardItem, BingoItemCategory } from "./BingoBoard";
import Emote from "./Emote";
import SavedCard, { SavedCardItem } from "./SavedState";

// Holy fuck this is so scuffed.
// TODO: Basically just... redo this entirely. Throw it all out and redo.

(document.getElementsByClassName("bingo-container")[0] as HTMLElement).addEventListener(
  "contextmenu",
  (e: MouseEvent) => e?.cancelable && e.preventDefault(),
);

const boardKey = "neurototallywontbeabandonedagainclueless";
const freeSpace = new BingoCardFreeSpace(
  "/assets/neuro_toma_zoo.jpg",
  "Neuro-Sama, holding a plushie, and Toma standing in a zoo surrounded by giraffe plushies, with a low-res image of a tiger in the background.",
  "borzoi_rizz",
  "https://discord.com/channels/574720535888396288/1286561951018778675/1286561951018778675",
  true,
);

setTimeout(() => {
  document.getElementById("bingo-artwork-credit-below")!.innerHTML =
    `Center artwork credit: <a href="${freeSpace.sourceUrl}" target="_blank">${freeSpace.artistName}</a>`;
});

if (window.localStorage.getItem("board-state") != null) {
  let data = JSON.parse(window.localStorage.getItem("board-state") as string) as SavedCard;

  if (data.stateKey != boardKey) generateNewBoard();
  else {
    // generate board from state
    let boardState = data.data.map((row: SavedCardItem[]) =>
      row.map((item: SavedCardItem) => new BingoCardItem(item.name, item.description, item.category, item.state)),
    );
    boardState[2][2] = freeSpace;

    const bingCard = new BingoCard(boardState);

    let saver = () =>
      window.localStorage.setItem(
        "board-state",
        JSON.stringify({
          stateKey: boardKey,
          data: bingCard.data.map((row) => {
            return row.map((item) => {
              return {
                name: item.name,
                description: item.description,
                category: item.category,
                state: item.state,
              };
            });
          }),
        } as SavedCard),
      );

    setInterval(() => saver(), 1000);

    bingCard.render(document.getElementsByClassName("bingo-container")[0] as HTMLElement);
  }
} else {
  generateNewBoard();
}

function generateNewBoard() {
  fetch("/data/boards/neuro_zoo.json")
    .then(async (data) => await data.json())
    .then((prompts: { name: string; description: string; category: string }[]) => {
      shuffleArray(prompts);

      console.log(prompts);

      const bingCard = new BingoCard([
        [
          BingoCardItem.fromBoardJSON(prompts[0]),
          BingoCardItem.fromBoardJSON(prompts[1]),
          BingoCardItem.fromBoardJSON(prompts[2]),
          BingoCardItem.fromBoardJSON(prompts[3]),
          BingoCardItem.fromBoardJSON(prompts[4]),
        ],
        [
          BingoCardItem.fromBoardJSON(prompts[5]),
          BingoCardItem.fromBoardJSON(prompts[6]),
          BingoCardItem.fromBoardJSON(prompts[7]),
          BingoCardItem.fromBoardJSON(prompts[8]),
          BingoCardItem.fromBoardJSON(prompts[9]),
        ],
        [
          BingoCardItem.fromBoardJSON(prompts[10]),
          BingoCardItem.fromBoardJSON(prompts[11]),
          freeSpace,
          BingoCardItem.fromBoardJSON(prompts[12]),
          BingoCardItem.fromBoardJSON(prompts[13]),
        ],
        [
          BingoCardItem.fromBoardJSON(prompts[14]),
          BingoCardItem.fromBoardJSON(prompts[15]),
          BingoCardItem.fromBoardJSON(prompts[16]),
          BingoCardItem.fromBoardJSON(prompts[17]),
          BingoCardItem.fromBoardJSON(prompts[18]),
        ],
        [
          BingoCardItem.fromBoardJSON(prompts[19]),
          BingoCardItem.fromBoardJSON(prompts[20]),
          BingoCardItem.fromBoardJSON(prompts[21]),
          BingoCardItem.fromBoardJSON(prompts[22]),
          BingoCardItem.fromBoardJSON(prompts[23]),
        ],
      ]);

      let saver = () =>
        window.localStorage.setItem(
          "board-state",
          JSON.stringify({
            stateKey: boardKey,
            data: bingCard.data.map((row) => {
              return row.map((item) => {
                return {
                  name: item.name,
                  description: item.description,
                  category: item.category,
                  state: item.state,
                };
              });
            }),
          } as SavedCard),
        );

      saver();

      setInterval(() => saver(), 1000);

      bingCard.render(document.getElementsByClassName("bingo-container")[0] as HTMLElement);
    });
}

function shuffleArray(array: any[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

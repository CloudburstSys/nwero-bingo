﻿/*
  Detects bingos by receiving a trigger event from a single mark and then propogating out to find bingos.
  Includes a funky debug mode that people can trigger by setting "window.BingoDetectionVisualisation" to true.
 */

import BingoCard, {
  BingoCardEmptyItem,
  BingoCardFreeSpace,
  BingoCardItem,
  BingoCardMultipleFreeSpaces
} from "./BingoCard";

(<any>globalThis).BingoDetectionVisualisation = false;

export default async function detect(x: number, y: number, state: boolean, card: BingoCard) {
  let counts = await getPossibleBingos(x, y, state, card);
  if (!state) {
    // Unmark if need be?
    console.log(counts);
    if ((<any>globalThis).BingoDetectionVisualisation) console.log(counts);
    for (let direction in counts) {
      if (counts[direction].length == 5) {
        counts[direction].forEach((item) => {
          item.item.togglable = true;
          item.item.marked = true;
          item.item.update(false);
          item.item.removeClass("bingo");
        });
      }
    }

    card.data[y][x].marked = false;
    card.data[y][x].update();
  } else {
    if ((<any>globalThis).BingoDetectionVisualisation) console.log(counts);
    for (let direction in counts) {
      if (counts[direction].length == 5) {
        //localStorage.setItem("bingo-score", (localStorage.getItem("bingo-score") === null ? 1 : parseInt(localStorage.getItem("bingo-score")!) + 1).toString());
        //document.getElementById("bingo-score")!.innerText = localStorage.getItem("bingo-score")!;
        counts[direction].forEach((item) => {
          item.item.togglable = false;
          item.item.marked = true;
          item.item.update(true);
          item.item.addClass("bingo");
        });
      }
    }
  }
}

export async function getPossibleBingos(x: number, y: number, state: boolean, card: BingoCard) {
  // Check the surrounding 8 positions.
  // XXX
  // X*X
  // XXX

  let result = [[x != y ? null : false, false, x + y != 4 ? null : false],
    [false,  null, false],
    [x + y != 4 ? null : false, false,  x != y ? null : false],];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      // query.
      let tx = x + dx;
      let ty = y + dy;
      if (tx < 0 || tx > 4) continue; // Don't go out of bounds!
      if (ty < 0 || ty > 4) continue;
      if (result[dy+1][dx+1] == null) continue;

      let item = card.data[ty][tx];

      // Visualisation for dev purposes
      if ((<any>globalThis).BingoDetectionVisualisation) {
        item.addClass("dev-checking");
        setTimeout(() => {
          if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
            setTimeout(() => {
              item.removeClass("dev-checking");
            }, 150);
          } else
            item.removeClass("dev-checking");
        }, 150);
      }

      result[dy+1][dx+1] = item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces;
    }
  }
  if ((<any>globalThis).BingoDetectionVisualisation) console.log(result);

  let bingos: number = bingoDefs[""];
  let counts: { [key: string]: { x: number, y: number, item: BingoCardItem }[] } = {
    "-": [ { x, y, item: card.data[y][x] } ],
    "|": [ { x, y, item: card.data[y][x] } ],
    "\\": [ { x, y, item: card.data[y][x] } ],
    "/": [ { x, y, item: card.data[y][x] } ]
  }

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      let res = result[dy+1][dx+1];

      if (res) {
        // We've got a match, continue checking.
        // Line - Horizontal LEFT -
        if (dy == 0 && dx == -1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("line horizontal left");
          let ty = y + dy;
          for (let tx = x-1; tx >= 0; tx--) {
            let item = card.data[ty][tx];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${tx}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["-"].push({ x: tx, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Line - Horizontal RIGHT -
        if (dy == 0 && dx == 1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("line horizontal right");
          let ty = y + dy;
          for (let tx = x+1; tx <= 4; tx++) {
            let item = card.data[ty][tx];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${tx}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["-"].push({ x: tx, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Line - Vertical UP |
        if (dx == 0 && dy == -1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("line vertical up");
          let tx = x + dx;
          for (let ty = y-1; ty >= 0; ty--) {
            let item = card.data[ty][tx];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${tx}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["|"].push({ x: tx, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Line - Vertical DOWN |
        if (dx == 0 && dy == 1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("line vertical down");
          let tx = x + dx;
          for (let ty = y+1; ty <= 4; ty++) {
            let item = card.data[ty][tx];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${tx}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["|"].push({ x: tx, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Across - Up + Left \
        if (dy == -1 && dx == -1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("across up left");
          for (let ty = y-1; ty >= 0; ty--) {
            let item = card.data[ty][ty];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${ty}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["\\"].push({ x: ty, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Across - Down + Right \
        if (dy == 1 && dx == 1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("across down right");
          for (let ty = y+1; ty <= 4; ty++) {
            let item = card.data[ty][ty];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${ty}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["\\"].push({ x: ty, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Across - Down + Left /
        if (dy == 1 && dx == -1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("across down left");
          for (let ty = y+1; ty <= 4; ty++) {
            let tx = 4 - ty;
            let item = card.data[ty][tx];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${tx}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["/"].push({ x: tx, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
        // Across - Up + Right /
        if (dy == -1 && dx == 1) {
          if ((<any>globalThis).BingoDetectionVisualisation) console.log("across up right");
          for (let ty = y-1; ty >= 0; ty--) {
            let tx = 4 - ty;
            let item = card.data[ty][tx];
            if ((<any>globalThis).BingoDetectionVisualisation) {
              console.log(`checking ${tx}, ${ty}`);
              item.addClass("dev-checking");
            }

            if (item.marked || item instanceof BingoCardFreeSpace || item instanceof BingoCardMultipleFreeSpaces) {
              counts["/"].push({ x: tx, y: ty, item });
              if ((<any>globalThis).BingoDetectionVisualisation)
                setTimeout(() => {
                  item.removeClass("dev-checking");
                }, 300);
            } else if ((<any>globalThis).BingoDetectionVisualisation)
              setTimeout(() => {
                item.removeClass("dev-checking");
              }, 150);
          }
        }
      }
    }
  }

  return counts;
}

const bingoDefs = {
  "": 0b0,
  "-": 0b1,
  "|": 0b01,
  "\\": 0b001,
  "/": 0b0001
}
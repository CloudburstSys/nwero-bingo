/*
  Detects bingos by receiving a trigger event from a single mark and then propogating out to find bingos.
  Includes a funky debug mode that people can trigger by setting "window.BingoDetectionVisualisation" to true.
 */

import BingoCard, {
  BingoCardEmptyItem,
  BingoCardFreeSpace,
  BingoCardItem,
  BingoCardMultipleFreeSpaces, BingoCardRegeneratingItem
} from "./BingoCard";
import { regeneratePrompts, shuffleArray } from "./Utils";
import { forceVedalThemeState } from "./ThemeManager";

(<any>globalThis).BingoDetectionVisualisation = false;

export default async function detect(x: number, y: number, state: boolean, card: BingoCard) {
  if (!state) return; // No use processing unmarks if we want bingos.

  // Check the surrounding 8 positions.
  // XXX
  // X*X
  // XXX

  let result = [[x != y ? null : false, false, x + y != 6 ? null : false],
                               [false,  null, false],
                               [x + y != 6 ? null : false, false,  x != y ? null : false],];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      // query.
      let tx = x + dx;
      let ty = y + dy;
      if (tx < 0 || tx > 6) continue; // Don't go out of bounds!
      if (ty < 0 || ty > 6) continue;
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
          for (let tx = x+1; tx <= 6; tx++) {
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
          for (let ty = y+1; ty <= 6; ty++) {
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
          for (let ty = y+1; ty <= 6; ty++) {
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
          for (let ty = y+1; ty <= 6; ty++) {
            let tx = 6 - ty;
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
            let tx = 6 - ty;
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

  if ((<any>globalThis).BingoDetectionVisualisation) console.log(counts);
  for (let direction in counts) {
    if (counts[direction].length == 7) {
      localStorage.setItem("bingo-score", (localStorage.getItem("bingo-score") === null ? 1 : parseInt(localStorage.getItem("bingo-score")!) + 1).toString());
      document.getElementById("bingo-score")!.innerText = localStorage.getItem("bingo-score")!;
      counts[direction].forEach((item) => {
        item.item.togglable = false;
        item.item.marked = false;
        item.item.update();
        item.item.addClass("bingo");
      });
      const sfx = document.getElementById("sfx_prompt_regen") as HTMLAudioElement;
      let spaces = await regeneratePrompts(card.data, counts[direction].length);
      shuffleArray(spaces);
      setTimeout(() => {
        sfx.play();
        counts[direction].forEach((item) => {
          let newItem = spaces.shift();
          if (newItem === undefined) {
            console.warn("Ran out of bingo prompts to regenerate! Is there enough extra prompts in the buckets?");
            return;
          }
          let emptyItem = new BingoCardRegeneratingItem(card, item.y, item.x, newItem);
          card.setItem(item.y, item.x, emptyItem);
        });
        forceVedalThemeState(null);
      }, 6000);
    }
  }
}

function generateNewPrompts() {

}

const bingoDefs = {
  "": 0b0,
  "-": 0b1,
  "|": 0b01,
  "\\": 0b001,
  "/": 0b0001
}
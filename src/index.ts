import "./index.scss";
import "./ThemeManager";
import BingoCard, { BingoCardFreeSpace, BingoCardItem, BingoCardMultipleFreeSpaces } from "./BingoCard";
import SavedState from "./SavedState";
import * as UpdateChecker from "./UpdateChecker";
import { loadPrompts, onClassChange, randomCharacters, regenerateBucket, saveState, shuffleArray } from "./Utils";
import Emote from "./Emote";

let card: BingoCard | null;
let cardSaveInterval: number | null = null;

document.getElementById("bingo-score")!.innerText = localStorage.getItem("bingo-score") ?? "0";

// Remove old storage name
window.localStorage.removeItem("board-state");
UpdateChecker.init((bucket: string) => {
  // This gets executed if an update is detected to stream.json
  regenerateBucket(card!, bucket);
}, () => {
  // This gets executed if an update is detected to schedule.json
  if(cardSaveInterval) clearInterval(cardSaveInterval);
  setTimeout(() => {
    window.localStorage.removeItem("card-state");
  }, 100);
});

let sfx = document.createElement("audio");
sfx.id = "sfx_prompt_regen";
sfx.src = "/assets/prompt_regen.mp3";
sfx.volume = 0.5;
document.body.appendChild(sfx);

// Fetch schedule JSON
fetch("/data/schedule.json")
  .then(async (data) => await data.json())
  .then(async (schedule: Schedule) => {
    let scheduleDays = [];

    for (let key in schedule) {
      let start = schedule[key].override?.start ? new Date(schedule[key].override!.start) : new Date(`${key}T12:00:00Z`);
      let end = schedule[key].override?.end ? new Date(schedule[key].override!.end) : new Date(`${key}T12:00:00Z`);
      if (!schedule[key].override?.end) end.setDate(end.getDate() + 1);

      scheduleDays.push({
        key,
        start,
        end,
      });
    }

    let day = scheduleDays.filter((day) => Date.now() >= day.start.getTime() && Date.now() < day.end.getTime())[0];

    // Check if stored card info needs to expire, if not restore from it, else generate a new card.
    if (window.localStorage.getItem("card-state") != null) {
      try {
        let cardState = JSON.parse(window.localStorage.getItem("card-state") as string) as SavedState;
        if (Date.now() <= new Date(cardState.expiry).getTime() || day == undefined) {
          // Card hasn't expired yet or there's no stream after an expired card, keep this one.
          //UpdateChecker.forceSetVersion();
          card = BingoCard.fromSavedState(cardState);
          card.render(document.getElementsByClassName("bingo-container")[0] as HTMLElement);

          document.getElementsByClassName("bingo-title")[0].innerHTML = card.name;
          document.getElementsByClassName("bingo-description")[0].innerHTML = card.description || "&nbsp;";

          cardSaveInterval = setInterval(() => saveState(card as BingoCard, cardState.expiry), 1000) as unknown as number;

          return;
        }
        // Board has expired, let it go down to the code below.
      } catch (err: any) {
        console.error("Encountered error while trying to parse JSON from board state in local storage: " + err.stack);
      }
    }

    // Board state is either null, expired, or errored out. We generate a new one here.

    if (day == undefined) {
      // There's no content for today? Mkay then.
      document.getElementsByClassName("bingo-title")[0].innerHTML = "No stream ongoing";
      let board = new BingoCard("No stream ongoing", "There's currently no stream right now, sorry!", 5, 5);

      board.render(document.getElementsByClassName("bingo-container")[0] as HTMLElement);
      return;
    }

    let cardInfo = schedule[day.key];

    document.getElementsByClassName("bingo-title")[0].innerHTML = cardInfo.name;
    document.getElementsByClassName("bingo-description")[0].innerHTML = cardInfo.description || "&nbsp;";

    let freeSpaces: [number, number][] = [];
    cardInfo.freeSpaces.forEach((freeSpace) => {
      if (freeSpaces.some((space) => space[0] == freeSpace.pos[0] && space[1] == freeSpace.pos[1])) return;
      freeSpaces.push(freeSpace.pos);
    });
    console.log(freeSpaces);
    let prompts = await loadPrompts(
      cardInfo.customBuckets,
      cardInfo.weights,
      cardInfo.boardHeight * cardInfo.boardWidth - freeSpaces.length,
    );
    shuffleArray(prompts);

    console.log(prompts);

    let j = 0;

    let board = new BingoCard(cardInfo.name, cardInfo.description, cardInfo.boardWidth, cardInfo.boardHeight);

    for (let i = 0; i <= cardInfo.boardWidth * cardInfo.boardHeight; i++) {
      if (i == cardInfo.boardWidth * cardInfo.boardHeight) {
        console.log(board);

        card = board;

        saveState(board, day.end);
        cardSaveInterval = setInterval(() => saveState(board, day.end), 1000) as unknown as number;

        board.render(document.getElementsByClassName("bingo-container")[0] as HTMLElement);
        return;
      }
      let column = i % cardInfo.boardHeight;
      let row = Math.floor(i / cardInfo.boardHeight);

      let freeSpacesForSpace = cardInfo.freeSpaces.filter(
        (freeSpace) => freeSpace.pos[0] == row && freeSpace.pos[1] == column,
      );
      let freeSpace: BingoCardFreeSpace | BingoCardMultipleFreeSpaces | null = null;

      if (freeSpacesForSpace.length > 1) {
        // There's multiple. Figure out what to do.
        if (cardInfo.multipleFreeSpacesBehaviour === "theme")
          if (freeSpacesForSpace.length > 2)
            console.warn(
              `There are more than 2 free spaces for space [${row}, ${column}] while multiple free space behaviour is set to "theme". Only the first 2 free spaces are considered in this mode. The extra free spaces will be ignored.`,
            );

        let spaces = freeSpacesForSpace.map(
          (freeSpace) =>
            new BingoCardFreeSpace(
              freeSpace.src,
              freeSpace.srcMarked,
              freeSpace.useMarkedAsReal,
              freeSpace.alt,
              freeSpace.credit.name,
              freeSpace.credit.source,
              freeSpace.description,
              freeSpace.overrideReminder,
              freeSpace.stretch,
            ),
        );

        freeSpace = new BingoCardMultipleFreeSpaces(cardInfo.multipleFreeSpacesBehaviour, spaces);
        freeSpace.update(document.body.classList.contains("dark") ? "dark" : "light");

        onClassChange(document.body, (body) => {
          (freeSpace as BingoCardMultipleFreeSpaces).update(body.classList.contains("dark") ? "dark" : "light");
        });
        j++;
      } else if (freeSpacesForSpace.length == 1) {
        console.log(
          freeSpacesForSpace[0].overrideReminder)
        freeSpace = new BingoCardFreeSpace(
          freeSpacesForSpace[0].src,
          freeSpacesForSpace[0].srcMarked,
          freeSpacesForSpace[0].useMarkedAsReal,
          freeSpacesForSpace[0].alt,
          freeSpacesForSpace[0].credit.name,
          freeSpacesForSpace[0].credit.source,
          freeSpacesForSpace[0].description,
          freeSpacesForSpace[0].overrideReminder,
          freeSpacesForSpace[0].stretch,
        );
        console.log(freeSpace.overriddenReminder);
        j++;
      }

      if (freeSpace != null) board.setItem(row, column, freeSpace);
      else {
        if (prompts[i - j] != null)
          board.setItem(row, column, new BingoCardItem(prompts[i - j]!.name, prompts[i - j]!.bucket, prompts[i - j]!.description));
        else
          console.warn(
            `Encountered null prompt at prompt number ${i - j}, row ${row} column ${column}. This usually means there's not enough prompts somewhere. Check above for more details.`,
          );
      }
    }
  });

interface Schedule {
  [key: string]: ScheduledDay;
}

interface ScheduledDay {
  name: string;
  description?: string;
  customBuckets: { [name: string]: string };
  weights: { [name: string]: number };
  boardWidth: number;
  boardHeight: number;
  override?: {
    start?: Date;
    end?: Date;
  };
  multipleFreeSpacesBehaviour: "random" | "theme";
  freeSpaces: FreeSpace[];
}

interface FreeSpace {
  pos: [number, number];
  src: string;
  srcMarked?: string;
  useMarkedAsReal?: boolean;
  alt: string;
  credit: {
    name: string;
    source: string;
  };
  stretch?: boolean;
  description?: string;
  overrideReminder?: string;
}

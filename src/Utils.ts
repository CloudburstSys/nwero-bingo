import BingoCard, {
  BingoCardEmptyItem,
  BingoCardFreeSpace,
  BingoCardItem,
  BingoCardRegeneratingItem
} from "./BingoCard";

/**
 * Shuffles an array in-place.
 * @param array The array to shuffle
 */
export function shuffleArray(array: any[]) {
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

/**
 * Executes `callback` when the classes of `element` are changed.
 * @param element The element to observe for class changes
 * @param callback The function to execute when a class is changed
 * @returns A function to end observation.
 */
export function onClassChange(element: HTMLElement, callback: (element: HTMLElement) => void) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        callback(mutation.target as HTMLElement);
      }
    });
  });
  observer.observe(element, { attributes: true });
  return observer.disconnect;
}

/**
 * Save the bingo card state
 * @param card The card to save
 * @param expiry When the save expires
 */
export function saveState(card: BingoCard, expiry: Date) {
  window.localStorage.setItem(
    "card-state",
    JSON.stringify({
      expiry,
      card: card.toJSON(),
    }),
  );
}

/**
 * Converts an object into an array of objects
 * @param object The object to convert
 * @returns An array of the objects keys and values.
 */
export function objectToArray(object: any): { key: string; value: any }[] {
  let output = [];
  for (let key in object) output.push({ key, value: object[key] });
  return output;
}

/**
 * Parses a prompt file into an array.
 * Uses objectToArray internally
 * @param promptObject The prompt object to parse
 * @returns The parsed prompt array
 */
export function parsePrompts(promptObject: {
  [name: string]: string;
}): { name: string; description: string; bgSrc?: string }[] {
  if (promptObject instanceof Array) return promptObject; // Support old format
  return objectToArray(promptObject).map((obj) => {
    if (typeof obj.value === "object") {
      return { name: obj.key, description: obj.value.description as string, bgSrc: obj.value.bg as string };
    }
    return { name: obj.key, description: obj.value as string };
  });
}

/**
 * Loads the prompts in using the weighted prompt bucket system
 * @param customBuckets Any custom buckets to import
 * @param weights The weights for the requested buckets
 * @param spaceCount The amount of spaces available on the board
 * @returns An array of prompts to put on the board.
 */
export async function loadPrompts(
  customBuckets: { [name: string]: string },
  weights: { [name: string]: number },
  spaceCount: number,
): Promise<({ name: string; bucket: string; description: string; bgSrc?: string } | null)[]> {
  let output: ({ name: string; bucket: string; description: string } | null)[] = [];

  const defaultBuckets: { [name: string]: string } = {
    //"neuro": "neuro.json",
    //"evil": "evil.json",
    //"vedal": "vedal.json",
    chat: "chat.json",
    //"partner": "partner.json"
  };
  const buckets: { [name: string]: { name: string; description: string }[] } = {};

  let combinedBuckets = { ...defaultBuckets, ...customBuckets };
  for (let key in weights) {
    if (combinedBuckets[key] == undefined) {
      console.error(
        `Weighs requested bucket "${key}" but that bucket does not exist, Did you forget to import a custom bucket? Prompt loading has failed.`,
      );
      return [];
    }
    let request = await fetch(`/data/boards/${combinedBuckets[key]}`);
    let prompts: { name: string; description: string }[] = parsePrompts(await request.json());
    console.log(prompts);
    shuffleArray(prompts);
    buckets[key] = prompts;
  }

  const weightArray = objectToArray(weights);
  let activeBucket = 0;
  let count = 0;

  for (let i = 1; i <= spaceCount; i++) {
    if (weightArray[activeBucket] == undefined) {
      console.warn(
        "There are more spaces on the bingo card then there are defined in weights. This will result in an incompleted board. Please fix this in the schedule configuation.",
      );
      output.push(null);
      continue;
    }
    if (weightArray[activeBucket].value == count) {
      activeBucket++;
      count = 0;
    }
    if (weightArray[activeBucket] == undefined) {
      console.warn(
        "There are more spaces on the bingo card then there are defined in weights. This will result in an incompleted board. Please fix this in the schedule configuation.",
      );
      output.push(null);
      continue;
    }
    if (buckets[weightArray[activeBucket].key][count] == undefined) {
      console.warn(
        `There are more prompts requested from the ${weightArray[activeBucket].key} bucket then there are in that bucket. This will result in an incompleted board. Either reduce the amount of prompts requested in schedule configuation or add more prompts to the ${weightArray[activeBucket].key} bucket.`,
      );
      output.push(null);
      count++;
      continue;
    }

    output.push(buckets[weightArray[activeBucket].key].map(prompt => {
      return {
        name: prompt.name,
        bucket: weightArray[activeBucket].key,
        description: prompt.description
      }
    })[count]);
    count++;
  }

  return output;
}

export async function regenerateBucket(card: BingoCard, bucket: string) {
  let request = await fetch(`/data/boards/streams/subathon/${bucket}.json`);
  let prompts: { name: string; description: string }[] = parsePrompts(await request.json());
  shuffleArray(prompts);
  console.log(prompts);

  let items: { row: number, column: number, item: BingoCardItem }[] = [];
  for (let row = 0; row < card.data.length; row++) {
    for (let column = 0; column < card.data[row].length; column++) {
      if (card.data[row][column].bucket != bucket) continue;
      items.push({
        row,
        column,
        item: card.data[row][column]
      });
    }
  }

  console.log(items);

  const sfx = document.getElementById("sfx_prompt_regen") as HTMLAudioElement;
  sfx.play();
  items.forEach(item => {
    items.forEach(item => {
      let prompt = prompts.shift();
      let bingoItem = new BingoCardItem(prompt!.name, bucket, prompt!.description);
      let generatingItem = new BingoCardRegeneratingItem(card, item.row, item.column, bingoItem);
      card.setItem(item.row, item.column, generatingItem);
    });
  });
}

export async function regeneratePrompts(boardData: BingoCardItem[][], amount: number) {
  let currentPrompts: string[] = [];
  boardData.forEach((row) => {
    row.forEach(item => {
      currentPrompts.push(item.name);
    });
  });

  let spaces: BingoCardItem[] = [];
  let possiblePromptsFiltered: { name: string; bucket: string; description: string; }[] = [];
  let possiblePrompts: { name: string; bucket: string; description: string; }[] = [];
  let freeSpaces: FreeSpace[] = [];

  for (const bucket of ["streams/subathon/stream", "streams/subathon/twin", "streams/subathon/vedal", "chat"]) {
    let request = await fetch(`/data/boards/${bucket}.json`);
    let prompts = parsePrompts(await request.json()).map(prompt => {
      return {
        name: prompt.name,
        bucket,
        description: prompt.description
      }
    });
    possiblePromptsFiltered.push(...prompts);
    possiblePrompts.push(...prompts);
  }

  possiblePromptsFiltered = possiblePromptsFiltered.filter(prompt => !currentPrompts.some(item => item == prompt.name));

  shuffleArray(possiblePromptsFiltered);
  shuffleArray(possiblePrompts);

  let request = await fetch(`/data/boards/streams/subathon/freeSpaces.json`).then(res => res.json());
  freeSpaces.push(...request);

  // TODO: Get all buckets, combine, and filter out currentPrompts. Then pick random ones for each boardData and set.
  for (let i = 0; i < amount; i++) {
    if (Math.floor(Math.random() * 10) === 1) {
      // TODO: Free space
      let randomFreeSpace = freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
      spaces.push(new BingoCardFreeSpace(randomFreeSpace.src, randomFreeSpace.srcMarked, randomFreeSpace.useMarkedAsReal, randomFreeSpace.alt, randomFreeSpace.credit.name, randomFreeSpace.credit.source, randomFreeSpace.description, randomFreeSpace.overrideReminder, randomFreeSpace.stretch));
    } else {
      let randomPrompt = null;
      if (possiblePromptsFiltered.length === 0)
        randomPrompt = possiblePrompts[Math.floor(Math.random() * possiblePrompts.length)];
      else
        randomPrompt = possiblePromptsFiltered.shift();
      spaces.push(new BingoCardItem(randomPrompt!.name, randomPrompt!.bucket, randomPrompt!.description));
    }
  }

  return spaces;
}

export async function randomCharacters(amount: number) {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let output = [];
  for (let i = 0; i < amount; i++) {
    output.push(characters.charAt(Math.floor(Math.random() * characters.length)));
  }

  return output.join("");
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
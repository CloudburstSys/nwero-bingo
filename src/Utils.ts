import { describe } from "node:test";
import BingoCard from "./BingoCard";

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
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
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
export function objectToArray(object: any): {key: string, value: any}[] {
  let output = [];
  for (let key in object) output.push({ key, value: object[key] });
  return output;
}

/**
 * Loads the prompts in using the weighted prompt bucket system
 * @param customBuckets Any custom buckets to import
 * @param weights The weights for the requested buckets
 * @param spaceCount The amount of spaces available on the board
 * @returns An array of prompts to put on the board.
 */
export async function loadPrompts(customBuckets: { [name: string]: string }, weights: { [name: string]: number }, spaceCount: number): Promise<({ name: string; description: string } | null)[]> {
  let output: ({ name: string; description: string } | null)[] = [];
  
  const defaultBuckets: { [name: string]: string } = {
    "neuro": "neuro.json",
    "evil": "evil.json",
    "vedal": "vedal.json",
    "chat": "chat.json",
    "partner": "partner.json"
  };
  const buckets: { [name: string]: { name: string; description: string }[] } = {};

  // TODO: This should probably be based on weights....
  let combinedBuckets = {...defaultBuckets, ...customBuckets};
  for(let key in weights) {
    if (combinedBuckets[key] == undefined) {
      console.error(`Weighs requested bucket "${key}" but that bucket does not exist, Did you forget to import a custom bucket? Prompt loading has failed.`);
      return [];
    }
    let request = await fetch(`/data/boards/${combinedBuckets[key]}`);
    let prompts: { name: string; description: string }[] = await request.json();
    shuffleArray(prompts);
    buckets[key] = prompts;
  }

  const weightArray = objectToArray(weights);
  let activeBucket = 0;
  let count = 0;
  
  for (let i = 1; i <= spaceCount; i++) {
    if (weightArray[activeBucket] == undefined) {
      console.warn("There are more spaces on the bingo card then there are defined in weights. This will result in an incompleted board. Please fix this in the schedule configuation.");
      output.push(null);
      continue;
    }
    if (weightArray[activeBucket].value == count) {
      activeBucket++;
      count = 0;
    }
    if (weightArray[activeBucket] == undefined) {
      console.warn("There are more spaces on the bingo card then there are defined in weights. This will result in an incompleted board. Please fix this in the schedule configuation.");
      output.push(null);
      continue;
    }
    if (buckets[weightArray[activeBucket].key][count] == undefined) {
      console.warn(`There are more prompts requested from the ${weightArray[activeBucket].key} bucket then there are in that bucket. This will result in an incompleted board. Either reduce the amount of prompts requested in schedule configuation or add more prompts to the ${weightArray[activeBucket].key} bucket.`)
      output.push(null);
      count++;
      continue;
    }

    output.push(buckets[weightArray[activeBucket].key][count]);
    count++;
  }

  return output;
}
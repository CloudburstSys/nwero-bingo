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
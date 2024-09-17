import BingoCard, { BingoCardItem } from "./BingoBoard";
import SavedCard, { SavedCardItem } from "./SavedState";

// Holy fuck this is so scuffed.
// TODO: Basically just... redo this entirely. Throw it all out and redo.

const boardKey = "n-D>dnfo8I^u%8+`-;gJ`]E!YA:)80Lo45y}@\"vrmt?yiN>DbISt)XgTlh(~fHcs"

if (window.localStorage.getItem("board-state") != null) {
    let data = JSON.parse(window.localStorage.getItem("board-state") as string) as SavedCard;

    if (data.stateKey != boardKey)
        generateNewBoard();
    else {
        // generate board from state
        let boardState = data.data.map((row: SavedCardItem[]) => row.map((item: SavedCardItem) => new BingoCardItem(item.text, item.state)));
        boardState[2][2] = new BingoCardItem("Imagine a cool artwork here. This is a free space", true, false);

        const bingCard = new BingoCard(boardState);

        let saver = () => window.localStorage.setItem("board-state", JSON.stringify({
            stateKey: boardKey,
            data: bingCard.data.map(row => {
                return row.map(item => {
                    return {
                        text: item.text,
                        state: item.state
                    }
                })
            })
        } as SavedCard));

        setInterval(() => saver(), 1000);

        bingCard.render(document.getElementsByClassName("bingo-container")[0] as HTMLElement);
    }
} else {
    generateNewBoard();
}

function generateNewBoard() {
    fetch("/boards/evil_solo.json").then(async data => await data.json()).then((prompts: string[]) => {

        shuffleArray(prompts);

        console.log(prompts);

        const bingCard = new BingoCard([
            [ new BingoCardItem(prompts[0]), new BingoCardItem(prompts[1]), new BingoCardItem(prompts[2]), new BingoCardItem(prompts[3]), new BingoCardItem(prompts[4]) ],
            [ new BingoCardItem(prompts[5]), new BingoCardItem(prompts[6]), new BingoCardItem(prompts[7]), new BingoCardItem(prompts[8]), new BingoCardItem(prompts[9]) ],
            [ new BingoCardItem(prompts[10]), new BingoCardItem(prompts[11]), new BingoCardItem("Imagine a cool artwork here. This is a free space.", true, false), new BingoCardItem(prompts[12]), new BingoCardItem(prompts[13]) ],
            [ new BingoCardItem(prompts[14]), new BingoCardItem(prompts[15]), new BingoCardItem(prompts[16]), new BingoCardItem(prompts[17]), new BingoCardItem(prompts[18]) ],
            [ new BingoCardItem(prompts[19]), new BingoCardItem(prompts[20]), new BingoCardItem(prompts[21]), new BingoCardItem(prompts[22]), new BingoCardItem(prompts[23]) ]
        ]);

        let saver = () => window.localStorage.setItem("board-state", JSON.stringify({
            stateKey: boardKey,
            data: bingCard.data.map(row => {
                return row.map(item => {
                    return {
                        text: item.text,
                        state: item.state
                    }
                })
            })
        } as SavedCard));

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
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}
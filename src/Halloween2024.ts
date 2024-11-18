// Handles silly little halloween stuff

import BingoCard, { BingoCardFreeSpace } from "./BingoCard";
import { randomCharacters } from "./Utils";

let bingoCardAffected = true;

let bingoCard: BingoCard | null = null;
let realTitle: string | null = null;
let realDesc: string | null = null;

export function init() {
  let html = document.getElementsByTagName("html")[0] as HTMLElement;
  let bingocontainer = document.getElementsByClassName("bingo-container")[0] as HTMLElement;
  setTimeout(() => {
    // @ts-ignore

    let loadStart = Date.parse("2024-10-31T19:00:00+00:00") + 100000;
    let hiyoriSet = false;
    let inversionState = false;
    let allowInvert = true;
    let lastInvert = Date.now();

    // We base off how far we have to clear based on the timestamp
    let halloweenInverval = setInterval(async () => {
      let siteClearTime = 600; // 10 minutes
      let bingoClearTime = 300; // 6 minutes - This physically affects the bingo, so avoid doing for too long
      let sinceStart = (Date.now() - loadStart) / 1000;

      if ((siteClearTime - sinceStart) / 600 < 1) {
        //console.log((clearTime - htmlClear) / 600);
        // @ts-ignore
        html["style"] = `filter: grayscale(${(siteClearTime - sinceStart) / 600});`;

        if (!hiyoriSet) {
          hiyoriSet = true;
          document.body.classList.add("hiyori");
          document.getElementsByClassName("bingo-title")[0].innerHTML = `Hiyori and Camila collab`;
          document.getElementsByClassName("bingo-description")[0].innerHTML = `Vedal may have deleted me but I survive... in my own ways.`;
        }

        if (document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src != `${window.location.protocol}//${window.location.host}/assets/emotes/hiyori.webp`) {
          document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = `/assets/emotes/hiyori.webp`;
          document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = "Hiyori Bingo";
        }

        if (bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].src != `${window.location.protocol}//${window.location.host}/assets/emotes/hiyori.webp` && bingoCardAffected) {
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].src = `/assets/emotes/hiyori.webp`;
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.add("invert");
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.remove("stretch");
        }

        if (Math.floor(Math.random() * 60) == 0 && allowInvert) {
          if ((Date.now() - lastInvert) > 200) {
            if (inversionState)
              // @ts-ignore
              bingocontainer["style"] = "filter: invert(1) grayscale(1);";
            else
              // @ts-ignore
              bingocontainer["style"] = "filter: invert(0) grayscale(1);";
            inversionState = !inversionState;
            lastInvert = Date.now();
          }
        }

        if ((bingoClearTime - sinceStart) / 600 > 0) {
          // Randomise the prompt content.
          for (let row = 0; row < bingocontainer.getElementsByClassName("bingo-row").length; row++) {
            for (let i = 0; i < bingocontainer.getElementsByClassName("bingo-row")[row].getElementsByClassName("bingo-item").length; i++) {
              let item = bingocontainer.getElementsByClassName("bingo-row")[row].getElementsByClassName("bingo-item")[i];
              if (item.getElementsByTagName("span").length > 0)
                item.getElementsByTagName("span")[0].innerHTML = await randomCharacters(14);
            }
          }
        }

        if ((bingoClearTime - sinceStart) / 600 < 0 && bingoCardAffected) {
          bingoCardAffected = false;

          // @ts-ignore
          bingocontainer["style"] = `filter: grayscale(0);`;

          // @ts-ignore
          bingocontainer["style"] = "filter: invert(0);";
          allowInvert = false;
          inversionState = false;

          for (let row = 0; row < bingocontainer.getElementsByClassName("bingo-row").length; row++) {
            for (let i = 0; i < bingocontainer.getElementsByClassName("bingo-row")[row].getElementsByClassName("bingo-item").length; i++) {
              let item = bingocontainer.getElementsByClassName("bingo-row")[row].getElementsByClassName("bingo-item")[i];
              if (item.getElementsByTagName("span").length > 0)
                (item.getElementsByTagName("span")[0] as HTMLElement).innerHTML = bingoCard!.data[row][i].name;
            }
          }

          document.getElementsByClassName("bingo-title")[0].innerHTML = realTitle!;
          document.getElementsByClassName("bingo-description")[0].innerHTML = realDesc!;

          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].src = `/assets/artworks/evil_witch_hiyori.gif`
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.add("stretch");
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.remove("invert");

          // Still run this, but slower, cos it'd be funny lol
          // setInterval(() => {
          //   if (Math.floor(Math.random() * 100) == 0) {
          //     flickerBoard(1000);
          //   }
          // },100);
        }

        if ((siteClearTime - sinceStart) / 600 < 0) {
          clearInterval(halloweenInverval);

          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].src = (bingoCard!.data[2][2] as BingoCardFreeSpace).imageUrl;
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.remove("invert");
          bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.add("stretch");

          setInterval(() => {
            if (document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src != `${window.location.protocol}//${window.location.host}/assets/emotes/hiyori.webp`) {
              document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = `/assets/emotes/hiyori.webp`;
              document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = "Hiyori Bingo";
            }
          });
        }
      }
    });
  });

  setTimeout(() => flickerBoard(300), 60000);

  setTimeout(() => flickerBoard(300), 90000);
  setTimeout(() => flickerBoard(300), 90500);
}

export function updateCard(card: BingoCard) {
  bingoCard = card;
}

export function updateTitle(title: string) {
  realTitle = title;
}

export function updateDescription(description: string) {
  realDesc = description;
}

function flickerBoard(duration: number = 300, setHeader: boolean = true){
  let bingocontainer = document.getElementsByClassName("bingo-container")[0] as HTMLElement;
  // @ts-ignore
  bingocontainer["style"] = "filter: invert(1) grayscale(1);";
  bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].src = `/assets/emotes/hiyori.webp`;
  bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.add("invert");
  bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.remove("stretch");

  document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = `/assets/emotes/hiyori.webp`;
  document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = "Hiyori Bingo";

  document.body.classList.add("hiyori");

  setTimeout(() => {
    // @ts-ignore
    bingocontainer["style"] = "filter: invert(0) grayscale(0);";
    bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].src = (bingoCard!.data[2][2] as BingoCardFreeSpace).imageUrl;
    bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.remove("invert");
    bingocontainer.getElementsByClassName("bingo-row")[2].getElementsByClassName("bingo-item")[2].getElementsByTagName("img")[0].classList.add("stretch");

    document.body.classList.remove("hiyori");

    if (setHeader) {
      if (document.body.classList.contains("dark")) {
        document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = "/assets/logo_dark.webp";
        document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = "Ewiv Bingo";
      } else {
        document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = "/assets/logo.webp";
        document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = "Nwero Bingo";
      }
    }
  },300);
}
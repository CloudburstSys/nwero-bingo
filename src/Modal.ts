import Emote from "./Emote";

export function showModal(prompt: string, description: string, bingoPrompt: HTMLElement, showUnmarkButton: boolean, reminderOverride?: string, unmarkCallback?: Function) {
  Emote.convert(prompt).then((str) => (document.getElementsByClassName("modal-prompt")[0].innerHTML = str));
  Emote.convert(description).then((str) => (document.getElementsByClassName("modal-description")[0].innerHTML = str));

  document.getElementsByClassName("modal")[0]!.classList.remove("modal-bingo");

  if (showUnmarkButton) {
    document.getElementsByClassName("modal")[0]!.classList.add("modal-bingo");

    document.getElementsByClassName("modal-unmark-prompt-btn")[0]!.addEventListener("click", async () => {
      // TODO: Unmark and trigger bingo check
      bingoPrompt.dispatchEvent(new Event("mousedown", {bubbles: true, cancelable: false}));
    }, {once: true});
  } else if (reminderOverride) {
    document.getElementsByClassName("modal-bottom")[0]!.querySelector("h3")!.innerHTML = "Dev note";
    Emote.convert(reminderOverride).then((str) => (
      document.getElementsByClassName("modal-bottom")[0]!.querySelector("div")!.innerHTML = `<span>${str}</span>`
    ));
  } else {
    document.getElementsByClassName("modal-bottom")[0]!.querySelector("h3")!.innerHTML = "Reminder";
    document.getElementsByClassName("modal-bottom")[0]!.querySelector("div")!.innerHTML = "" +
      "              <span\n" +
      "                >Do not lazily bait the sisters into fulfilling bingo prompts! This is meant to be something to do while\n" +
      "                watching, not a competition or TODO list.</span\n" +
      "              >\n" +
      "              <br /><br />\n" +
      "              <span>Prompts fulfilled from lazily baiting the sisters into them do NOT count.</span>";
  }

  document.getElementsByClassName("modal-container")[0].classList.add("active");
  document.getElementsByClassName("overlay")[0].classList.add("active");
}

export function hideModal() {
  document.getElementsByClassName("modal-container")[0].classList.remove("active");
  document.getElementsByClassName("overlay")[0].classList.remove("active");
}

document.getElementsByClassName("modal-close")[0].addEventListener("click", () => hideModal());
document.getElementsByClassName("overlay")[0].addEventListener("click", () => hideModal());
document.getElementsByClassName("overlay")[0].addEventListener("contextmenu", (e) => e.preventDefault());
document.getElementsByClassName("modal-container")[0].addEventListener("click", () => hideModal());
document.getElementsByClassName("modal-container")[0].addEventListener("contextmenu", (e) => e.preventDefault());

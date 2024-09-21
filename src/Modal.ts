import Emote from "./Emote";

export function showModal(prompt: string, description: string) {
    Emote.convert(prompt).then(str => document.getElementsByClassName("modal-prompt")[0].innerHTML = str);
    Emote.convert(description).then(str => document.getElementsByClassName("modal-description")[0].innerHTML = str);
    
    document.getElementsByClassName("modal")[0].classList.add("active");
    document.getElementsByClassName("overlay")[0].classList.add("active");
}

export function hideModal() {
    document.getElementsByClassName("modal")[0].classList.remove("active");
    document.getElementsByClassName("overlay")[0].classList.remove("active");
}

document.getElementsByClassName("modal-close")[0].addEventListener("click", () => hideModal());
document.getElementsByClassName("overlay")[0].addEventListener("click", () => hideModal());
document.getElementsByClassName("overlay")[0].addEventListener("contextmenu", (e) => e.preventDefault());
// Handles dark mode management and switching.
let darkModeDefault =
  (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches &&
    (localStorage.getItem("theme") === "dark" || localStorage.getItem("theme") === null)) ||
  localStorage.getItem("theme") === "dark";
let darkTheme = false;
let vedalTheme = false;

function switchTheme() {
  if (darkTheme) {
    document.body.classList.remove("dark");
    document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = `/assets/${vedalTheme ? "tutel.png" : "logo.webp"}`;
    document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = `${vedalTheme ? "Vedal" : "Nwero"} Bingo`;
    document.getElementsByClassName("theme-switcher")[0].getElementsByTagName("img")[0].src = "/assets/dark.svg";
    document.getElementsByClassName("vedal-theme-switcher")[0].getElementsByTagName("img")[0].src = `/assets/vedal-theme-${vedalTheme ? "on" : "off"}-light.png`;
  } else {
    document.body.classList.add("dark");
    document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = `/assets/${vedalTheme ? "tutel.png" : "logo_dark.webp"}`;
    document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = `${vedalTheme ? "Vedal" : "Ewiv"} Bingo`;
    document.getElementsByClassName("theme-switcher")[0].getElementsByTagName("img")[0].src = "/assets/light.svg";
    document.getElementsByClassName("vedal-theme-switcher")[0].getElementsByTagName("img")[0].src = `/assets/vedal-theme-${vedalTheme ? "on" : "off"}-dark.png`;
  }

  darkTheme = !darkTheme;

  localStorage.setItem("theme", darkTheme ? "dark" : "light");
}

function switchVedal() {
  if (vedalTheme) {
    document.body.classList.remove("vedal");
    document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = `/assets/${darkTheme ? "logo_dark" : "logo"}.webp`;
    document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = `${darkTheme ? "Ewiv" : "Nwero"} Bingo`;
    document.getElementsByClassName("vedal-theme-switcher")[0].getElementsByTagName("img")[0].src = `/assets/vedal-theme-off-${darkTheme ? "dark" : "light"}.png`;
  } else {
    document.body.classList.add("vedal");
    document.getElementsByClassName("logo")[0].getElementsByTagName("img")[0].src = "/assets/tutel.png";
    document.getElementsByClassName("logo")[0].getElementsByTagName("span")[0].innerText = "Vedal Bingo";
    document.getElementsByClassName("vedal-theme-switcher")[0].getElementsByTagName("img")[0].src = `/assets/vedal-theme-on-${darkTheme ? "dark" : "light"}.png`;
  }

  vedalTheme = !vedalTheme;

  localStorage.setItem("vedal", vedalTheme ? "on" : "off");
}

if (darkModeDefault) switchTheme();

document.getElementsByClassName("theme-switcher")[0].addEventListener("click", () => switchTheme());

export function forceVedalThemeState(state: boolean | null) {
  if (state === null) {
    if (localStorage.getItem("bingo-score") === null || parseInt(localStorage.getItem("bingo-score")!) < 2) {
      if (localStorage.getItem("bingo-score") !== null || parseInt(localStorage.getItem("bingo-score")!) == 1)
        switchVedal();
      (document.getElementsByClassName("vedal-theme-switcher")[0] as HTMLElement).style.display = "none";
    } else {
      (document.getElementsByClassName("vedal-theme-switcher")[0] as HTMLElement).style.display = "initial";
      document.getElementsByClassName("vedal-theme-switcher")[0].addEventListener("click", () => switchVedal());

      if (localStorage.getItem("vedal") === "on") {
        switchVedal();
      }
    }
  } else {
    vedalTheme = !state;
    switchVedal();
  }
}

forceVedalThemeState(null);
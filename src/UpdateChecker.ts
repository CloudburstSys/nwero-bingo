/*
    Checks /commitinfo.txt every minute to see if there's a new update.
    If there is, displays a header above the bingo card.
 */

const updateHeader = document.querySelector(".banner.update-banner") as HTMLDivElement;

export function init(callback: Function) {
  checkForUpdate(callback);
  setInterval(async () => {
    await checkForUpdate(callback);
  }, 60000)
}

/**
 * Forcefully sets the version, for example, if the schedule is outdated.
 */
export async function forceSetVersion() {
  let upstream = await fetch('/commitinfo.txt').then((res) => res.text());
  localStorage.setItem("version", upstream);
}

async function checkForUpdate(callback: Function) {
  try {
    let current = localStorage.getItem("version");
    let upstream = await fetch('/commitinfo.txt').then((res) => res.text());

    if (current == null){
      current = upstream;
      localStorage.setItem("version", upstream);
    }

    if (current != upstream && upstream != "DEVBUILD") {
      // Update detected.
      console.log("Detected update");
      await callback();
      updateHeader.classList.add("active");

      // Don't listen for clicks if we don't need to.
      updateHeader.querySelector("button")!.addEventListener("click", (e) => {
        localStorage.setItem("version", upstream);
        location.reload();
      });
    }
  } catch (error) {
    console.warn("Tried to fetch from upstream but failed. Is the host offline?", error);
  }
}
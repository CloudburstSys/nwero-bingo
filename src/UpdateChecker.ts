/*
    Checks /commitinfo.txt every minute to see if there's a new update.
    If there is, displays a header above the bingo card.
 */

const updateHeader = document.querySelector(".banner.update-banner") as HTMLDivElement;
let updateDetected = false;

export async function init(rerollCallback: Function, refreshCallback: Function) {
  let gitInfo = parseGitInfo(await fetch('/commitinfo.txt').then((res) => res.text()));

  (<any>globalThis).BuildInformation = {
    //branch: gitInfo.branch,
    commit: gitInfo.commitId
  };

  setInterval(async () => {
    await checkForUpdate(rerollCallback, refreshCallback);
  }, 30000);
}

/**
 * Forcefully sets the version, for example, if the schedule is outdated.
 */
export async function forceSetVersion() {
  let upstream = parseGitInfo(await fetch('/commitinfo.txt').then((res) => res.text()));
  localStorage.setItem("version", upstream.commitId);
}

async function checkForUpdate(rerollCallback: Function, refreshCallback: Function) {
  try {
    let current = localStorage.getItem("version");
    let gitInfo = parseGitInfo(await fetch('/commitinfo.txt').then((res) => res.text()));

    if (current == null){
      current = gitInfo.commitId;
      localStorage.setItem("version", gitInfo.commitId);
    }

    if ((current != gitInfo.commitId && !updateDetected) || (gitInfo.commitId == "DEVBUILD" && !updateDetected)) {
      // Update detected.
      console.log("Detected update");
      updateDetected = true;

      console.log(gitInfo);

      if (gitInfo.changedFiles.some(file => file.endsWith(".ts") || file.endsWith(".scss"))) {
        // Codebase update + maybe JSON
        if(gitInfo.changedFiles.some(file => file.endsWith(".json"))) {
          // There's JSON, check if it's stream.json or schedule.json
          if (gitInfo.changedFiles.includes("public/data/schedule.json")) {
            // There's an update to the schedule.json file, request user refresh + reset board
            updateHeader.classList.add("active");
            updateHeader.querySelector("b")!.innerText = "Your bingo card will be reset.";
            updateHeader.querySelector("b")!.classList.add("danger");

            // Don't listen for clicks if we don't need to.
            updateHeader.querySelector("button")!.addEventListener("click", async (e) => {
              await refreshCallback();
              setTimeout(() => {
                localStorage.setItem("version", gitInfo.commitId);
                location.reload();
              }, 200);
            }, { once: true });
          } else if (gitInfo.changedFiles.includes("public/data/boards/streams/subathon/stream.json")) {
            setTimeout(async () => {
              await rerollCallback();
              setTimeout(() => {
                localStorage.setItem("version", gitInfo.commitId);
                location.reload();
              }, 7000);
            }, document.querySelectorAll(".bingo-item.bingo").length > 0 ? 13000 : 0);
          } else {
            // JSON we don't care about, refresh.
            setTimeout(() => {
              localStorage.setItem("version", gitInfo.commitId);
              location.reload();
            }, document.querySelectorAll(".bingo-item.bingo").length > 0 ? 13000 : 0);
          }
        } else {
          // Do not prompt, just refresh.
          setTimeout(() => {
            localStorage.setItem("version", gitInfo.commitId);
            location.reload();
          }, document.querySelectorAll(".bingo-item.bingo").length > 0 ? 13000 : 0);
        }
      } else if (gitInfo.changedFiles.some(file => file.endsWith(".json"))) {
        // Only JSON
        if (gitInfo.changedFiles.includes("public/data/schedule.json")) {
          // There's an update to the schedule.json file, request user refresh + reset board
          updateHeader.classList.add("active");
          updateHeader.querySelector("b")!.innerText = "Your bingo card will be reset.";
          updateHeader.querySelector("b")!.classList.add("danger");

          // Don't listen for clicks if we don't need to.
          updateHeader.querySelector("button")!.addEventListener("click", async (e) => {
            await refreshCallback();
            setTimeout(() => {
              localStorage.setItem("version", gitInfo.commitId);
              location.reload();
            }, 200);
          }, {once: true});
        } else if (gitInfo.changedFiles.includes("public/data/boards/streams/subathon/stream.json")) {
          // There's an update to the stream.json file, regen it's prompts.
          setTimeout(async () => {
            await rerollCallback();
            setTimeout(() => {
              localStorage.setItem("version", gitInfo.commitId);
              updateDetected = false;
            }, 7000);
          }, document.querySelectorAll(".bingo-item.bingo").length > 0 ? 13000 : 0);
        }
      }
    }
  } catch (error) {
    console.warn("Tried to fetch from upstream but failed. Is the host offline?", error);
  }
}

function parseGitInfo(txt: string): GitInfo {
  let regex = /([\w\d]{5,10}) (\(HEAD -> (?:[\w\d/]+)(?:, .+)+\))? (.+)\r?\n([\w\W]*)/gi;
  let info = regex.exec(txt.trim());

  if (info === null) throw new ReferenceError("String provided does not match nwero-bingo commitinfo file");

  return {
    commitId: info[1],
    //branch: info[2],
    message: info[2],
    changedFiles: info[3].trim().replaceAll("\r", "").split("\n")
  }
}

interface GitInfo {
  commitId: string,
  //branch: string,
  message: string,
  changedFiles: string[]
}
// Function to fetch data via API
async function fetchDataAsync(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Functions to create and append elements
function elementCreator(tag, { ...props }) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  return el;
}

function childrenAppender(parentElm, childrenElms) {
  childrenElms.forEach((childElm) => {
    parentElm.appendChild(childElm);
  });
}

// Get IDs and names of players
const players = ["com-2", "com-3", "player", "com-1"];
const playersDiv = document.querySelector(".players");

let playersToPlayerNamesMapping = {};
players.forEach((player) => {
  playersToPlayerNamesMapping[player] = player.toUpperCase().replace("-", " ");
});

if (Object.keys(localStorage).includes("player-name")) {
  playersToPlayerNamesMapping["player"] = localStorage["player-name"];
}

// Event listener for music
document.querySelector("#audio-button").addEventListener("click", (event) => {
  if (event.target.style.backgroundColor === "salmon") {
    event.target.style.backgroundColor = "lawngreen";
    document.querySelector("audio").play();
  } else {
    event.target.style.backgroundColor = "salmon";
    document.querySelector("audio").pause();
  }
});

// Set up HTML
function setUpHTML() {
  players.forEach((player) => {
    const playPassButtonsDiv = elementCreator("div", {
      className: "play-pass-buttons",
    });

    childrenAppender(playPassButtonsDiv, [
      elementCreator("button", {
        className: "play",
        type: "button",
        innerText: "Play",
      }),
      elementCreator("button", {
        className: "pass",
        type: "button",
        innerText: "Pass",
      }),
    ]);

    const playerNameAndPassPlayButtons = elementCreator("div", {
      className: "player-name-and-pass-play-buttons",
    });

    childrenAppender(playerNameAndPassPlayButtons, [
      elementCreator("h5", {
        className: "player-name",
        innerText: playersToPlayerNamesMapping[player],
      }),
      playPassButtonsDiv,
    ]);

    const sortButtonsDiv = elementCreator("div", {
      className: "sort-buttons",
    });

    childrenAppender(sortButtonsDiv, [
      elementCreator("button", {
        className: "sort-number",
        type: "button",
        innerText: "Sort By Value",
      }),
      elementCreator("button", {
        className: "sort-suit",
        type: "button",
        innerText: "Sort By Suit",
      }),
    ]);

    const mainPlayerDiv = elementCreator("div", {
      id: `${player}`,
      className: "player",
    });

    childrenAppender(mainPlayerDiv, [
      playerNameAndPassPlayButtons,
      elementCreator("div", {
        id: `${player}-hand-container`,
        className: "hand-container",
      }),
      sortButtonsDiv,
    ]);

    childrenAppender(playersDiv, [mainPlayerDiv]);
  });
}

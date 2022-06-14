//DeckID
const deckID = "tyu78tcx00jy";
const urlShuffle = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`;
const urlDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`;
const urlAddDeckPartial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/`;

//Function to create elements
function elementCreator(tag, { ...props }) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  return el;
}

//Function to fetch data via API
async function fetchDataAsync(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function getCardCodesFromCards(cardsObjs) {
  const result = cardsObjs.map((cardObj) => cardObj.code).join(",");
  return result;
}

// imageURLS = {}; //key is players, value is an array of card image urls

async function distributeCards() {
  await fetchDataAsync(urlShuffle);
  const data = await fetchDataAsync(urlDraw);
  const allCards = data.cards;
  const players = ["playerHand", "com1Hand", "com2Hand", "com3Hand"];

  for (const [index, player] of players.entries()) {
    const quarterOfCards = allCards.slice(index * 13, (index + 1) * 13);

    await fetchDataAsync(
      urlAddDeckPartial +
        `${player}/add/?cards=${getCardCodesFromCards(quarterOfCards)}`
    );

    const arrayOfCardImagesURLs = quarterOfCards.map(
      (cardObj) => cardObj.image
    );

    const arrayOfCardCodes = quarterOfCards.map((cardObj) => cardObj.code);

    const container = document.querySelector(`#${player}Cards`);
    arrayOfCardImagesURLs.forEach((url, index) => {
      container.appendChild(
        elementCreator("img", {
          src: url,
          className: `${player}-holding cards`,
          id: arrayOfCardCodes[index],
        })
      );
    });
    console.log("done", index);
  }
}

distributeCards();

// EVENT LISTENER FOR SORTING
const sortNumButton = document.querySelector(".sort-number");
const orderMapping = {};
sortNumButton.addEventListener("click", sortNums);

suitsRank = {
  D: 1,
  C: 2,
  H: 3,
  S: 4,
};

valueRank = {
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
  2: 15,
};

function sortNums() {
  const imagesArray = document.querySelectorAll(".playerHand-holding"); //nodes

  const codesOfCurrentOrder = [...imagesArray].map((imgElm) => imgElm.id);
  const copyOfCodesToSort = [...codesOfCurrentOrder];

  copyOfCodesToSort.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
  copyOfCodesToSort.sort((a, b) => valueRank[a[0]] - valueRank[b[0]]);

  console.log("copyOfCodesToSort", copyOfCodesToSort);

  codesOfCurrentOrder.forEach((code) => {
    orderMapping[code] = parseInt(copyOfCodesToSort.indexOf(code));
  });

  imagesArray.forEach((imgElm) => {
    imgElm.style.order = orderMapping[imgElm.id];
  });
}

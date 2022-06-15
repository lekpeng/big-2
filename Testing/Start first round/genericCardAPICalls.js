// Consts used in API Calls
const deckID = "tyu78tcx00jy";
const urlShuffle = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`;
const urlDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`;
const urlAddDeckPartial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/`;
const urlListDeckPartial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/`;
const playingPile = "playingPile";
const discardPile = "discardPile";

// Card Distribution
function getCardCodesFromCards(cardsObjs) {
  return cardsObjs.map((cardObj) => cardObj.code).join(",");
}

async function distributeCards() {
  await fetchDataAsync(urlShuffle);
  const data = await fetchDataAsync(urlDraw);
  const allCards = data.cards;
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
  }
}

// Cards Listing
const playerHandsCodesOnly = {}; //array of card objects
const playerHands = {}; //array of card codes strings

async function ListAllCards() {
  for (player of players) {
    const result = await fetchDataAsync(urlListDeckPartial + `${player}/list/`);
    // console.log("current player", player);
    // console.log("result", result);
    const ArrayOfCardObj = result.piles[`${player}`].cards;
    playerHands[player] = ArrayOfCardObj;
    playerHandsCodesOnly[player] = ArrayOfCardObj.map(
      (CardObj) => CardObj.code
    );
  }
}

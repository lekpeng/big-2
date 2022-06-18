// Constants used in API Calls
const deckID = "tyu78tcx00jy";
const urlShuffle = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`;
const urlDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`;
const urlAddOrListDeckPartial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/`;
const playingPile = "playingpile";
const discardPile = "discardpile";

// Distribution of Cards
// convert from array of card obj to comma format
function getCommaFormatFromCardObjs(cardsObjs) {
  return getCommaFormatFromCodes(cardsObjs.map((cardObj) => cardObj.code));
}
// convert from array of card codes to comma format
function getCommaFormatFromCodes(cardsArr) {
  return cardsArr.join(",");
}

async function distributeCards() {
  // shuffle and draw all cards
  await fetchDataAsync(urlShuffle);
  const data = await fetchDataAsync(urlDraw);
  const allCards = data.cards;

  // distribute cards to players
  for (const [index, player] of players.entries()) {
    const quarterOfCards = allCards.slice(index * 13, (index + 1) * 13);
    await fetchDataAsync(
      urlAddOrListDeckPartial +
        `${playersToPilesMapping[player]}/add/?cards=${getCommaFormatFromCardObjs(quarterOfCards)}`
    );

    const container = document.querySelector(`#${player}-hand-container`);
    // create card objects in DOM
    quarterOfCards.forEach((cardObj) => {
      container.appendChild(
        elementCreator("img", {
          src: cardObj.image,
          className: `${player}-holding cards`,
          id: cardObj.code,
        })
      );
    });
  }
}

// List Cards in Player Piles
async function listAllCards() {
  for (player of players) {
    const data = await fetchDataAsync(
      urlAddOrListDeckPartial + `${playersToPilesMapping[player]}/list/`
    );
    const cardObjs = data.piles[`${playersToPilesMapping[player]}`].cards;
    playerHandsCodesOnly[player] = cardObjs.map((cardObj) => cardObj.code);
  }
}

// Add Cards to Playing Pile
async function addCardsToPlayingPile(cardCodes) {
  await fetchDataAsync(
    urlAddOrListDeckPartial + `${playingPile}/add/?cards=${getCommaFormatFromCodes(cardCodes)}`
  );

  // add to playing pile in DOM
  cardCodes.forEach((cardCode) => {
    const imgElm = document.querySelector(`[id="${cardCode}"]`);
    playingPileContainer.appendChild(imgElm);
    makeCardMovableInPlayingPile(imgElm);
  });
}

// Discard playing pile cards after round
async function discardPlayingPile(cardCodes) {
  await fetchDataAsync(
    urlAddOrListDeckPartial + `${discardPile}/add/?cards=${getCommaFormatFromCodes(cardCodes)}`
  );

  // remove from playing pile in DOM
  cardCodes.forEach((cardCode) => {
    const imgElm = document.querySelector(`[id="${cardCode}"]`);
    imgElm.remove();
  });
}

//DeckID
const deckID = "tyu78tcx00jy";
const urlDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`;
const urlPlayerPartial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/playerHand/add/?cards=`;
const urlCom1Partial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/com1Hand/add/?cards=`;
const urlCom2Partial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/com2Hand/add/?cards=`;
const urlCom3Partial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/com3Hand/add/?cards=`;

//Function to fetch data via API
async function fetchDataAsync(url) {
  const response = await fetch(url);
  const data = await response.json();
  // console.log("data", url, data);
  return data;
}

function getCardCodesFromCards(cardsObjs) {
  const result = cardsObjs.map((cardObj) => cardObj.code).join(",");
  // console.log("comma-string-cards", result);
  return result;
}

async function distributeCards() {
  const data = await fetchDataAsync(urlDraw);
  const allCards = data.cards;
  console.log(allCards);
  await fetchDataAsync(
    urlPlayerPartial + getCardCodesFromCards(allCards.slice(0, 13))
  );
  await fetchDataAsync(
    urlCom1Partial + getCardCodesFromCards(allCards.slice(13, 26))
  );
  await fetchDataAsync(
    urlCom2Partial + getCardCodesFromCards(allCards.slice(26, 39))
  );
  await fetchDataAsync(
    urlCom3Partial + getCardCodesFromCards(allCards.slice(39, 52))
  );
  console.log("done");
}

distributeCards();

//DeckID
const deckID = "tyu78tcx00jy";

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

let allCards;

async function distributeCards() {
  fetchDataAsync(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`)
    .then((rs) => {
      allCards = rs.cards;
      return fetchDataAsync(
        `https://deckofcardsapi.com/api/deck/${deckID}/pile/playerHand/add/?cards=${getCardCodesFromCards(
          allCards.slice(0, 13)
        )}`
      );
    })
    .then((rs) => {
      return fetchDataAsync(
        `https://deckofcardsapi.com/api/deck/${deckID}/pile/com1Hand/add/?cards=${getCardCodesFromCards(
          allCards.slice(13, 26)
        )}`
      );
    })
    .then((rs) => {
      return fetchDataAsync(
        `https://deckofcardsapi.com/api/deck/${deckID}/pile/com2Hand/add/?cards=${getCardCodesFromCards(
          allCards.slice(26, 39)
        )}`
      );
    })
    .then((rs) => {
      console.log("done");
      return fetchDataAsync(
        `https://deckofcardsapi.com/api/deck/${deckID}/pile/com3Hand/add/?cards=${getCardCodesFromCards(
          allCards.slice(39, 52)
        )}`
      );
    });
}
distributeCards();

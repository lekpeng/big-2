//DeckID
const deckID = "tyu78tcx00jy";

//Function to fetch data via API
async function fetchDataAsync(url) {
  const response = await fetch(url);
  const data = await response.json();
  console.log("data", url, data);
  return data;
}

let playerHand;
let computer1Hand;
let computer2Hand;
let computer3Hand;

fetchDataAsync(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`)
  .then((rs) => {
    const allCards = rs.cards;
    playerHand = allCards.slice(0, 13);
    computer1Hand = allCards.slice(13, 26);
    computer2Hand = allCards.slice(26, 39);
    computer3Hand = allCards.slice(39, 52);
    return fetchDataAsync(`https://deckofcardsapi.com/api/deck/${deckID}/pile/pile1/add/?cards=3D`);
  })
  .then((rs) => {
    console.log("playerHand", playerHand);
    console.log("computer1Hand", computer1Hand);
    console.log("computer2Hand", computer2Hand);
    console.log("computer3Hand", computer3Hand);
  });

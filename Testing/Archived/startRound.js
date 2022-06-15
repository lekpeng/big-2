//DeckID
const deckID = "tyu78tcx00jy";
const urlDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`;
const urlListDeckPartial = `https://deckofcardsapi.com/api/deck/${deckID}/pile/`;

//Function to fetch data via API
const playerHandsCodesOnly = {};
const playerHands = {};
const players = ["playerHand", "com1Hand", "com2Hand", "com3Hand"];

async function ListAllCards() {
  for (const [index, player] of players.entries()) {
    const result = await fetchDataAsync(urlListDeckPartial + `${player}/list/`);
    const ArrayOfCardObj = result.piles[`${player}`].cards;
    playerHands[player] = ArrayOfCardObj;
    playerHandsCodesOnly[player] = ArrayOfCardObj.map(
      (CardObj) => CardObj.code
    );
    console.log("done", index);
  }
  console.log("this should come after 4 dones");
}

async function DiamondThreeStart() {
  await ListAllCards();
  for (player of players) {
    if (playerHandsCodesOnly[player].includes("3D")) {
      console.log(player);
      return;
    }
  }
}

DiamondThreeStart();

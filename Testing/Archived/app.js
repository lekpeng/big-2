// Names of players and cards
const players = ["playerHand", "com1Hand", "com2Hand", "com3Hand"];
const playerHandsCodesOnly = {}; //array of card objects
const playerHands = {}; //array of card codes strings

// DOM ELEMENTS
const instructionsDiv = document.querySelector("#instructions");

class Valid {
  constructor(cards) {
    //cards here is an array of the codes...
    this.cards = cards;
    this.num = cards.length;
  }

  //valid in terms of beating opponent if player clicked play
  validFirstTurnFirstRound() {
    console.log("cards here", this.cards);
    if (!this.validCount) {
      console.log("invalid count");
    }
    if (!this.cards.includes("3D")) {
      console.log("no 3D");
    }

    if (!this.validCards()) {
      console.log("cards invalid");
    }
    return this.validCount() && this.cards.includes("3D") && this.validCards;
  }

  validFirstTurn() {}

  validGenericTurn() {}

  // VALID IN TERMS OF COUNT
  validCount() {
    return this.num === 1 || this.num === 2 || this.num === 5;
  }

  // IF COUNT VALID, ARE CARDS VALID?

  validCards() {
    if (this.num === 2) {
      return this.validDouble();
    }
    return true;
  }
  // else if (this.num === 5) {
  //   return this.validFiveCard()}

  // can generalise this to checking for triple/quadruple, this function alr assumes the num matches
  validDouble() {
    const valueToMatch = this.cards[0][0];
    return this.cards.every((code) => code[0] === valueToMatch);
  }
}

class round {
  constructor(type, turn = null) {
    this.type = type;
    this.turn = turn;
    this.numCardsPlayed = 0;
  }

  async findDiamondThreeOwner() {
    await ListAllCards();
    for (player of players) {
      if (playerHandsCodesOnly[player].includes("3D")) {
        this.turn = player;
      }
    }
  }

  async startRound() {
    if (this.type === "first") {
      await this.findDiamondThreeOwner();
      this.setInstructionsInDOM(
        `${this.turn} is holding the 3 of Diamonds and should start the game`
      );
    }
  }

  //owner should be a string and cards should be an array of 1, 2 or 5 cards
  addToPile(cardCodesSepByComma) {
    `https://deckofcardsapi.com/api/deck/${deckID}/pile/${playingPile}/add/?cards=${cardCodesSepByComma}`;
  }

  setInstructionsInDOM(msg) {
    instructionsDiv.innerText = msg;
  }

  // continueRound()
}

class bigTwoGame {
  constructor() {}

  async startGame() {
    await distributeCards();
    const firstRound = new round("first");
    this.currentRound = firstRound;
    firstRound.startRound();
  }
}

newGame = new bigTwoGame();
newGame.startGame();

// EVENT LISTENERS FOR CARDS CLICKING (the green light only appears when it's your turn)
const handCardsContainers = document.querySelectorAll(".hand-cards");
handCardsContainers.forEach((handCardsContainer) => {
  handCardsContainer.addEventListener("click", (event) => {
    const cardElm = event.target;
    // return if not player's turn or player clicked on something that's not a card?
    if (cardElm.className !== `${newGame.currentRound.turn}-holding cards`) {
      return;
    }

    // if card is not selected, select it
    if (!cardElm.title || cardElm.title === "unselected") {
      cardElm.title = "selected";
      // cardElm.style.boxShadow = "0 0 10px 1px rgb(11, 243, 11)";
    } else {
      cardElm.title = "unselected";
    }
  });
});

// EVENT LISTENERS FOR PASS AND PLAY BUTTONS
const passButtons = document.querySelectorAll(".pass");
const playButtons = document.querySelectorAll(".play");

passButtons.forEach((passButton) => {
  passButton.addEventListener("click", (event) =>
    checkValidAction("pass", event)
  );
});

playButtons.forEach((playButton) => {
  playButton.addEventListener("click", (event) =>
    checkValidAction("play", event)
  );
});

function checkValidAction(action, event) {
  const currentRound = newGame.currentRound;
  const selectedCardsCodes = [
    ...document.querySelectorAll(".cards[title='selected']"),
  ].map((cardImgElm) => cardImgElm.id);

  console.log("selectedCards", selectedCardsCodes);
  if (event.target.parentNode.id !== currentRound.turn) {
    console.log("not your turn bodoh");
    // not player's turn
    return;
  }
  if (currentRound.type === "first" && currentRound.numCardsPlayed === 0) {
    if (action === "pass") {
      // player with 3D cannot pass
      console.log("player with 3D cannot pass");
      return;
    } else {
      console.log("type of input into valid", typeof selectedCardsCodes);
      const checkValidity = new Valid(selectedCardsCodes);
      if (checkValidity.validFirstTurnFirstRound()) {
        console.log("this is valid");
        // call API to deal and remove the set of cards from player's deck and put into playing pile
      } else {
        console.log("this is invalid");
      }
    }
  }
}

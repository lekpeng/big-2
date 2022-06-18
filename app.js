// Names of players and cards
const playerHandsCodesOnly = {}; //array of card objects
// const playerHands = {}; //array of card codes strings
const players = ["player", "com-1", "com-2", "com-3"];

let playersToPlayerNamesMapping = {};
players.forEach((player) => {
  playersToPlayerNamesMapping[player] = player.toUpperCase().replace("-", " ");
});

let playersToPilesMapping = {};
players.forEach((player) => {
  playersToPilesMapping[player] = player.replace("-", "");
});

// DOM ELEMENTS
const instructionsContainer = document.querySelector("#instructions");
const handCardsContainers = document.querySelectorAll(".hand-container");
const playingPileContainer = document.querySelector("#playing-pile-container");

class Valid {
  constructor(cards, currentRound) {
    //cards here is an array of the codes
    this.cards = cards;
    this.currentRound = currentRound;
    this.num = cards.length;
  }

  // check validity based on turn
  validFirstTurn() {
    if (this.currentRound.type === "first") {
      return this.validCount() && this.cards.includes("3D") && this.validCards();
    }
    return this.validCount() && this.validCards();
  }

  validGenericTurn() {
    return (
      this.num === this.currentRound.numCardsAllowed &&
      this.validCards() &&
      this.validBeatsOpponent()
    );
  }

  // check if the number of cards are valid (used for first turn)
  validCount() {
    return this.num === 1 || this.num === 2 || this.num === 5;
  }

  // assuming counts are valid, check if the cards are valid
  validCards() {
    if (this.num === 2) {
      return this.validSameValue();
    } else if (this.num === 5) {
      return this.validFiveCard();
    }
    return true;
  }

  // can also use this for checking three of a kind and four of a kind
  validSameValue() {
    // get value of first card
    const valueToMatch = this.cards[0][0];
    return this.cards.every((code) => code[0] === valueToMatch);
  }

  // assuming cards are valid, check if the cards beat the cards from the previous turn
  cardCodeToRank(code) {
    let value, suit;
    [value, suit] = code.split("");
    return [valuesRank[value], suitsRank[suit]];
  }

  validBeatsOpponent() {
    let valueToBeatRank, suitToBeatRank;
    [valueToBeatRank, suitToBeatRank] = this.cardCodeToRank(this.currentRound.cardsToBeat[0]);

    let valueRankFirstCard, suitRankFirstCard;
    [valueRankFirstCard, suitRankFirstCard] = this.cardCodeToRank(this.cards[0]);

    if (this.num === 1) {
      return (
        valueRankFirstCard > valueToBeatRank ||
        (valueRankFirstCard === valueToBeatRank && suitRankFirstCard > suitToBeatRank)
      );
    }

    if (this.num === 2) {
      let valueRankSecond, suitRankSecond;
      [valueRankSecond, suitRankSecond] = this.cardCodeToRank(this.cards[1]);
      return (
        valueRankFirstCard > valueToBeatRank || suitRankFirstCard === 4 || suitRankSecond === 4
      );
    }
  }
}

class Round {
  constructor(type, turn = null) {
    this.type = type; //takes the value "first" or "normal"
    this.turn = turn; //whose turn
    this.isFirstTurn = true; // this tells us whether it's the first turn of a game or not
    this.numPasses = 0;
    this.cardsToBeat;
    this.numCardsAllowed;
  }
  addToPlayingPile(cardsArr) {
    // api call
    addCardsToPlayingPile(cardsArr);
    if (this.isFirstTurn) {
      this.isFirstTurn = false;
      this.numCardsAllowed = cardsArr.length;
    }
    this.cardsToBeat = cardsArr;
    this.setTurnForNextPlayer();
    // cardsArr.forEach((code) => {
    //   document.querySelector(`[id="${code}"]`).title = "unselected";
    // });
  }

  setTurnForNextPlayer() {
    const currIndex = players.indexOf(this.turn);
    this.turn = players[(currIndex + 1) % 4];
    this.setInstructionsInDOM(`It is now ${playersToPlayerNamesMapping[this.turn]}'s turn!`);
  }

  async findDiamondThreeOwner() {
    await listAllCards();
    for (const player of players) {
      if (playerHandsCodesOnly[player].includes("3D")) {
        this.turn = player;
      }
    }
  }

  async startRound() {
    if (this.type === "first") {
      await this.findDiamondThreeOwner();
      this.setInstructionsInDOM(
        `${
          playersToPlayerNamesMapping[this.turn]
        } is holding the 3 of Diamonds and should start the game.`
      );
    } else {
      this.setInstructionsInDOM(
        `Everyone passed after ${playersToPlayerNamesMapping[this.turn]}'s previous turn, so ${
          playersToPlayerNamesMapping[this.turn]
        } is free to start a new round!`
      );
      const cardsNodes = playingPileContainer.querySelectorAll("[class$='holding cards']");
      const cardsArr = [...cardsNodes].map((elm) => elm.id);
      discardPlayingPile(cardsArr);
    }
  }

  setInstructionsInDOM(msg) {
    instructionsContainer.innerText = msg;
  }
}

class BigTwoGame {
  constructor() {
    this.currentRound;
  }

  toggleCardSelection(event) {
    const cardElm = event.target;
    // return if not player's turn
    if (cardElm.className !== `${this.currentRound.turn}-holding cards`) {
      return;
    }

    // if card is not selected, select it
    if (!cardElm.title || cardElm.title === "unselected") {
      cardElm.title = "selected";
    } else {
      cardElm.title = "unselected";
    }
  }

  checkValidAction(action, event) {
    const selectedCardsCodes = [...document.querySelectorAll(".cards[title='selected']")].map(
      (cardImgElm) => cardImgElm.id
    );

    selectedCardsCodes.forEach((code) => {
      document.querySelector(`[id="${code}"]`).title = "unselected";
    });

    const nameOfPlayerHittingButton = playersToPlayerNamesMapping[event.target.parentNode.id];
    if (event.target.parentNode.id !== this.currentRound.turn) {
      this.currentRound.setInstructionsInDOM(`Not your turn, ${nameOfPlayerHittingButton}!`);
      return;
    }

    if (action === "pass") {
      if (this.currentRound.isFirstTurn) {
        this.currentRound.setInstructionsInDOM(
          `You cannot pass in the first turn, ${nameOfPlayerHittingButton}!`
        );
        return;
      }
      this.currentRound.setTurnForNextPlayer();
      this.currentRound.numPasses += 1;

      // start a new round when there are three consecutive passes
      if (this.currentRound.numPasses === 3) {
        this.currentRound = new Round("normal", this.currentRound.turn);
        this.currentRound.startRound();
      }
    } else {
      const checkValidity = new Valid(selectedCardsCodes, this.currentRound);
      let toCheck;
      if (this.currentRound.isFirstTurn) {
        toCheck = checkValidity.validFirstTurn();
      } else {
        toCheck = checkValidity.validGenericTurn();
      }

      if (toCheck) {
        this.currentRound.addToPlayingPile(selectedCardsCodes);
        this.currentRound.numPasses = 0; // actually unnecessary if first turn, since it's alr 0
      } else {
        this.currentRound.setInstructionsInDOM(
          `This is an invalid selection, ${nameOfPlayerHittingButton}!`
        );
      }
    }
  }

  async startGame() {
    await distributeCards();
    this.currentRound = new Round("first");
    this.currentRound.startRound();

    // EVENT LISTENERS FOR CARDS CLICKING (the green light only appears when it's your turn)
    handCardsContainers.forEach((handCardsContainer) => {
      handCardsContainer.addEventListener("click", (event) => this.toggleCardSelection(event));
    });

    // EVENT LISTENERS FOR PASS AND PLAY BUTTONS
    const passButtons = document.querySelectorAll(".pass");
    const playButtons = document.querySelectorAll(".play");

    passButtons.forEach((passButton) => {
      passButton.addEventListener("click", (event) => this.checkValidAction("pass", event));
    });

    playButtons.forEach((playButton) => {
      playButton.addEventListener("click", (event) => this.checkValidAction("play", event));
    });
  }
}

newGame = new BigTwoGame();
newGame.startGame();

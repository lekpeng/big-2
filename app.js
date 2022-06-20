// REFLECT SPECIFIC FEEDBACK FOR INVALID SELECTION => ADD 5 CARD COMBIS AND WINNING CONDITIONS
// => MAKE COM 1-3 ACTUAL ROBOTS

// CONST VARIABLES
const playerHandsCodesOnly = {}; //array of card objects

const players = ["player", "com-1", "com-2", "com-3"];

let playerNumCardsThrown = {};
players.forEach((player) => {
  playerNumCardsThrown[player] = 11;
});

// can change names of players here if we wish.
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

  // check validity based on turn, see if can return array of boolean, and the specific thing that is invalid if any.
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

  validFiveCard() {
    return (
      validStraight() ||
      validFlush() ||
      validFullHouse() ||
      validFourOfAKind() ||
      validStraightFlush()
    );
  }

  // can also use this for checking three of a kind and four of a kind
  validSameValue(cardsArr = this.cards) {
    // get value of first card
    const numberToMatch = cardsArr[0][0];
    return cardsArr.every((code) => code[0] === numberToMatch);
  }

  validStraight() {
    const cardValues = this.cards.map((code) => valuesRank[code[0]]);
    const sortedValues = cardValues.sort();
    if (cardValues.includes(15)) {
      // equivalent to having cards 2,3,4,5,6 or A,2,3,4,5
      return sortedValues === [3, 4, 5, 6, 15] || sortedValues === [3, 4, 5, 14, 15];
    }
    const minVal = Math.min(...cardValues);
    return sortedValues === [...Array(5).keys()].map((i) => i + minVal);
  }

  validFlush() {
    const suitToMatch = this.cards[0][1];
    return this.cards.every((code) => code[1] === suitToMatch);
  }

  validFullHouse() {
    const cardNums = this.cards.map((code) => [code[0]]);
    const sortedNums = cardNums.sort();
    return (
      (this.validSameValue(sortedNums.slice(0, 2)) && this.validSameValue(sortedNums.slice(2))) ||
      (this.validSameValue(sortedNums.slice(0, 3)) && this.validSameValue(sortedNums.slice(3)))
    );
  }

  validFourOfAKind() {
    const cardNums = this.cards.map((code) => [code[0]]);
    const sortedNums = cardNums.sort();
    return this.validSameValue(
      sortedNums.slice(0, 4) || this.validSameValue(sortedNums.slice(1, 5))
    );
  }

  validStraightFlush() {
    return this.validFlush() && validStraight();
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
    this.turn = turn; //takes the player IDs
    this.isFirstTurn = true;
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
    playerNumCardsThrown[this.turn] += cardsArr.length;
    if (this.foundWinningPlayer()) {
      this.setInstructionsInDOM(
        `The winner is ${playersToPlayerNamesMapping[this.foundWinningPlayer()]}`
      );
      // DELETE ALL ELEMENTS and announce winner maybe.
    } else {
      this.setTurnForNextPlayer();
    }
  }

  foundWinningPlayer() {
    // returns undefined if no winner yet, else return player ID
    return players.find((player) => playerNumCardsThrown[player] === 13);
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

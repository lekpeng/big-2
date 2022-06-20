// REFLECT SPECIFIC FEEDBACK FOR INVALID SELECTION => ADD 5 CARD COMBIS AND WINNING CONDITIONS
// => MAKE COM 1-3 ACTUAL ROBOTS

// CONST VARIABLES
const playerHandsCodesOnly = {}; //array of card objects

const players = ["player", "com-1", "com-2", "com-3"];

let playerNumCardsThrown = {};
players.forEach((player) => {
  playerNumCardsThrown[player] = 0;
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
    let bool = true;
    let msg = "";

    if (this.currentRound.type === "first" && !this.cards.includes("3D")) {
      bool = false;
      msg = "You must make use of the 3 of Diamonds in the first turn of the first round";
    } else if (!this.validCount()) {
      bool = false;
      msg = "You can only play 1, 2 or 5 cards";
    } else if (!this.validCards()) {
      bool = false;
      if (this.num === 2) {
        msg = "Both cards must have the same value";
      } else {
        msg =
          "You must play one of the following: Straight, Flush, Full House, Four Of A Kind or Straight Flush";
      }
    }
    return [bool, msg];
  }

  validGenericTurn() {
    let bool = true;
    let msg = "";

    if (this.num !== this.currentRound.numCardsAllowed) {
      bool = false;
      msg = `You must play ${this.currentRound.numCardsAllowed} cards in this round`;
    } else if (!this.validCards()) {
      bool = false;
      if (this.num === 2) {
        msg = "Both cards must have the same value";
      } else {
        msg =
          "You must play one of the following: Straight, Flush, Full House, Four Of A Kind or Straight Flush";
      }
    } else if (!this.validBeatsOpponent()) {
      bool = false;
      msg = "This set of cards is not higher ranked than the one in the previous turn";
    }
    return [bool, msg];
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
      return this.validFiveCards();
    }
    return true;
  }

  validFiveCards() {
    return (
      this.validStraight() ||
      this.validFlush() ||
      this.validFullHouse() ||
      this.validFourOfAKind() ||
      this.validStraightFlush()
    );
  }

  // can also use this for checking three of a kind and four of a kind
  validSameValue(cardsArr = this.cards) {
    // get value of first card
    const numberToMatch = cardsArr[0][0];
    return cardsArr.every((code) => code[0] === numberToMatch);
  }

  validStraight(cardsArr = this.cards) {
    const cardValues = cardsArr.map((code) => valuesRank[code[0]]);
    const sortedValues = cardValues.sort((a, b) => a - b);

    if (cardValues.includes(15)) {
      const arrayToCompareFirst = [3, 4, 5, 6, 15];
      const arrayToCompareSecond = [3, 4, 5, 14, 15];
      // equivalent to having cards 2,3,4,5,6 or A,2,3,4,5
      return (
        sortedValues.every((value, index) => value === arrayToCompareFirst[index]) ||
        sortedValues.every((value, index) => value === arrayToCompareSecond[index])
      );
    }
    const minVal = Math.min(...cardValues);
    const arrayToCompare = [...Array(5).keys()].map((i) => i + minVal);
    return sortedValues.every((value, index) => value === arrayToCompare[index]);
  }

  validFlush(cardsArr = this.cards) {
    const suitToMatch = cardsArr[0][1];
    return cardsArr.every((code) => code[1] === suitToMatch);
  }

  validFullHouse(cardsArr = this.cards) {
    const cardNums = cardsArr.map((code) => [code[0]]);
    const sortedNums = cardNums.sort(); // generic sort will do here
    return (
      (this.validSameValue(sortedNums.slice(0, 2)) && this.validSameValue(sortedNums.slice(2))) ||
      (this.validSameValue(sortedNums.slice(0, 3)) && this.validSameValue(sortedNums.slice(3)))
    );
  }

  validFourOfAKind(cardsArr = this.cards) {
    const cardNums = cardsArr.map((code) => [code[0]]);
    const sortedNums = cardNums.sort(); // generic sort will do here
    return (
      this.validSameValue(sortedNums.slice(0, 4)) || this.validSameValue(sortedNums.slice(1, 5))
    );
  }

  validStraightFlush(cardsArr = this.cards) {
    return this.validFlush(cardsArr) && this.validStraight(cardsArr);
  }

  // assuming cards are valid, check if the cards beat the cards from the previous turn
  cardCodeToRank(code) {
    let value, suit;
    [value, suit] = code.split("");
    return [valuesRank[value], suitsRank[suit]];
  }

  validBeatsOpponent() {
    if (this.num === 1 || this.num === 2) {
      return this.validBeatsOpponent1Or2Cards();
    }
    console.log("calling valid for 5 cards");
    return this.validBeatsOpponent5Cards();
  }

  validBeatsOpponent1Or2Cards(
    num = this.num,
    cards = this.cards,
    cardsToBeat = this.currentRound.cardsToBeat
  ) {
    let valueToBeatRank, suitToBeatRank;
    [valueToBeatRank, suitToBeatRank] = this.cardCodeToRank(cardsToBeat[0]);

    let valueRankFirstCard, suitRankFirstCard;
    [valueRankFirstCard, suitRankFirstCard] = this.cardCodeToRank(cards[0]);

    if (num === 1) {
      return (
        valueRankFirstCard > valueToBeatRank ||
        (valueRankFirstCard === valueToBeatRank && suitRankFirstCard > suitToBeatRank)
      );
    } else if (num === 2) {
      let valueRankSecond, suitRankSecond;
      [valueRankSecond, suitRankSecond] = this.cardCodeToRank(cards[1]);
      return (
        valueRankFirstCard > valueToBeatRank || suitRankFirstCard === 4 || suitRankSecond === 4
      );
    }
  }

  typeFiveCards(cardsArr = this.cards()) {
    if (this.validStraightFlush(cardsArr)) {
      return "straightflush";
    } else if (this.validStraight(cardsArr)) {
      return "straight";
    } else if (this.validFlush(cardsArr)) {
      return "flush";
    } else if (this.validFullHouse(cardsArr)) {
      return "fullhouse";
    } else {
      return "fourofakind";
    }
  }

  getTriple(sortedCardsArr) {
    if (sortedCardsArr[0][0] === sortedCardsArr[2][0]) {
      return sortedCardsArr[0];
    }
    return sortedCardsArr[2];
  }

  getQuadruple(sortedCardsArr) {
    if (sortedCardsArr[0][0] === sortedCardsArr[3][0]) {
      return sortedCardsArr[0];
    }
    return sortedCardsArr[3];
  }

  validBeatsOpponent5Cards() {
    const fiveCardsRank = {
      straight: 1, //take max card for both and compare like single cards
      flush: 2, // look at suit rank, if same suit then take take max card for both and compare like single cards
      fullhouse: 3, // look at triple card value
      fourofakind: 4, // look at quadruple card value
      straightflush: 5, // same as straight
    };

    const fiveCardsRankToBeat = fiveCardsRank[this.typeFiveCards(this.currentRound.cardsToBeat)];
    const fiveCardsRankCurrPlayer = fiveCardsRank[this.typeFiveCards(this.cards)];

    console.log("fiveCardsRankToBeat", fiveCardsRankToBeat);
    console.log("fiveCardsRankCurrPlayer", fiveCardsRankCurrPlayer);

    if (fiveCardsRankCurrPlayer !== fiveCardsRankToBeat) {
      return fiveCardsRankCurrPlayer > fiveCardsRankToBeat;
    }

    [this.currentRound.cardsToBeat, this.cards].forEach((cards) => {
      cards.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
      cards.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
    });

    if (fiveCardsRankToBeat === 1 || fiveCardsRankToBeat === 5) {
      // comparing straights
      return this.validBeatsOpponent1Or2Cards(1, this.cards[4], this.currentRound.cardsToBeat[4]);
    } else if (fiveCardsRankToBeat === 2) {
      // comparing flushes
      const suitsRankToBeat = suitsRank[this.currentRound.cardsToBeat[0][1]];
      const suitsRankCurrPlayer = suitsRank[this.cards[0][1]];

      if (suitsRankCurrPlayer !== suitsRankToBeat) {
        return suitsRankCurrPlayer > suitsRankToBeat;
      }
      return valuesRank[this.cards[4][0]] > valuesRank[this.currentRound.cardsToBeat[4][0]];
    } else if (fiveCardsRankToBeat === 3) {
      // comparing full houses
      return this.validBeatsOpponent1Or2Cards(
        1,
        this.getTriple(this.cards),
        this.getTriple(this.currentRound.cardsToBeat)
      );
    } else {
      // comparing four of a kinds
      return this.validBeatsOpponent1Or2Cards(
        1,
        this.getQuadruple(this.cards),
        this.getQuadruple(this.currentRound.cardsToBeat)
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

      if (toCheck[0]) {
        this.currentRound.addToPlayingPile(selectedCardsCodes);
        this.currentRound.numPasses = 0; // actually unnecessary if first turn, since it's alr 0
      } else {
        this.currentRound.setInstructionsInDOM(`${toCheck[1]}, ${nameOfPlayerHittingButton}!`);
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

// This should be unique for each player so that multiple people can play at the same time. Try putting in local cache
const deckID = "tyu78tcx00jy";
const urlShuffle = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`;
const urlDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`;

// Will track terminating condition
let playerNumCardsThrown = {};
players.forEach((player) => {
  playerNumCardsThrown[player] = 0;
});

// DOM Elements
const instructionsContainer = document.querySelector("#instructions");
const playingPileContainer = document.querySelector("#playing-pile-container");
const previousTurnContainer = document.querySelector(".previous-turn-container");
const currentTurnContainer = document.querySelector(".current-turn-container");

// Checks for validity of player's selection of cards when player clicks "play" button
class Valid {
  constructor(cards, currentRound) {
    // Cards here is an array of card codes
    this.cards = cards;
    this.num = cards.length;
    this.currentRound = currentRound;
    this.cardsTypeIfFiveCard;
  }

  validFirstTurn() {
    let bool = false;
    let msg = "";

    if (this.currentRound.type === "first" && !this.cards.includes("3D")) {
      msg = "You must make use of the 3 of Diamonds in the first turn of the first round";
    } else if (!this.validCount()) {
      msg = "You can only play 1, 2 or 5 cards";
    } else {
      const validCardsObj = this.validCards();
      if (!validCardsObj.valid) {
        msg = this.messageForInvalidCards();
      } else {
        bool = true;
        this.currentRound.cardsToBeatTypeIfFiveCard = validCardsObj.typeIf5Card;
      }
    }
    return { validTurn: bool, message: msg };
  }

  validGenericTurn() {
    let bool = false;
    let msg = "";

    if (this.num !== this.currentRound.numCardsAllowed) {
      msg = `You must play ${this.currentRound.numCardsAllowed} card(s) in this round`;
    } else {
      const validCardsObj = this.validCards();
      this.cardsTypeIfFiveCard = validCardsObj.typeIf5Card;
      if (!validCardsObj.valid) {
        msg = this.messageForInvalidCards();
      } else if (!this.validBeatsOpponent()) {
        msg = "This set of cards is not higher ranked than the one in the previous turn";
      } else {
        bool = true;
        this.currentRound.cardsToBeatTypeIfFiveCard = this.cardsTypeIfFiveCard;
      }
    }
    return { validTurn: bool, message: msg };
  }

  // Checks if the number of cards is valid (used for first turn)
  validCount() {
    return this.num === 1 || this.num === 2 || this.num === 5;
  }

  // Assuming the number of cards is valid, check if the cards are valid
  validCards() {
    if (this.num === 2) {
      return { valid: this.validSameValue(), typeIf5Card: null };
    } else if (this.num === 5) {
      return this.validFiveCards();
    } // Case of single card
    return { valid: true, typeIf5Card: null };
  }

  messageForInvalidCards() {
    if (this.num === 2) {
      return "Both cards must have the same value";
    }
    return "You must play one of the following: Straight, Flush, Full House, Four Of A Kind or Straight Flush";
  }

  validSameValue(cardsArr = this.cards) {
    // Get value of first card
    const numberToMatch = cardsArr[0][0];
    return cardsArr.every((code) => code[0] === numberToMatch);
  }

  validFiveCards(cardsArr = this.cards) {
    let type;
    let bool = true;
    if (this.validStraightFlush(cardsArr)) {
      type = "straightflush";
    } else if (this.validStraight(cardsArr)) {
      type = "straight";
    } else if (this.validFlush(cardsArr)) {
      type = "flush";
    } else if (this.validFullHouse(cardsArr)) {
      type = "fullhouse";
    } else if (this.validFourOfAKind(cardsArr)) {
      type = "fourofakind";
    } else {
      bool = false;
      type = null;
    }
    return { valid: bool, typeIf5Card: type };
  }

  validStraight(cardsArr = this.cards) {
    const sortedValues = cardsArr
      .map((code) => BigTwoGame.valuesRank[code[0]])
      .sort((a, b) => a - b);

    // Edge case when largest card is a 2
    if (sortedValues[4] === 15) {
      const arrayToCompareFirst = [3, 4, 5, 6, 15];
      const arrayToCompareSecond = [3, 4, 5, 14, 15];
      // Equivalent to having cards 2,3,4,5,6 or A,2,3,4,5
      return (
        sortedValues.every((value, index) => value === arrayToCompareFirst[index]) ||
        sortedValues.every((value, index) => value === arrayToCompareSecond[index])
      );
    }
    const minVal = sortedValues[0];
    const arrayToCompare = [...Array(5).keys()].map((i) => i + minVal);
    return sortedValues.every((value, index) => value === arrayToCompare[index]);
  }

  validFlush(cardsArr = this.cards) {
    const suitToMatch = cardsArr[0][1];
    return cardsArr.every((code) => code[1] === suitToMatch);
  }

  validFullHouse(cardsArr = this.cards) {
    const cardNums = cardsArr.map((code) => [code[0]]);
    // Generic sort will do here as we just want the triple and double to be together
    const sortedNums = cardNums.sort();
    return (
      (this.validSameValue(sortedNums.slice(0, 2)) && this.validSameValue(sortedNums.slice(2))) ||
      (this.validSameValue(sortedNums.slice(0, 3)) && this.validSameValue(sortedNums.slice(3)))
    );
  }

  validFourOfAKind(cardsArr = this.cards) {
    const cardNums = cardsArr.map((code) => [code[0]]);
    // Generic sort will do here as we just want the quadruple to be together
    const sortedNums = cardNums.sort();

    return (
      this.validSameValue(sortedNums.slice(0, 4)) || this.validSameValue(sortedNums.slice(1, 5))
    );
  }

  validStraightFlush(cardsArr = this.cards) {
    return this.validFlush(cardsArr) && this.validStraight(cardsArr);
  }

  // Assuming cards are valid, check if the cards beat the cards from the previous turn
  validBeatsOpponent() {
    if (this.num === 1 || this.num === 2) {
      return this.validBeatsOpponent1Or2Cards();
    }
    return this.validBeatsOpponent5Cards();
  }

  cardCodeToRank(code) {
    let value, suit;
    [value, suit] = code.split("");
    return [BigTwoGame.valuesRank[value], BigTwoGame.suitsRank[suit]];
  }

  validBeatsOpponent1Or2Cards(
    num = this.num,
    cards = this.cards,
    cardsToBeat = this.currentRound.cardsToBeat
  ) {
    let valueRankToBeat, suitRankToBeat;
    [valueRankToBeat, suitRankToBeat] = this.cardCodeToRank(cardsToBeat[0]);

    let valueRankFirst, suitRankFirst;
    [valueRankFirst, suitRankFirst] = this.cardCodeToRank(cards[0]);

    if (num === 1) {
      return (
        valueRankFirst > valueRankToBeat ||
        (valueRankFirst === valueRankToBeat && suitRankFirst > suitRankToBeat)
      );
    } else if (num === 2) {
      let valueRankSecond, suitRankSecond;
      [valueRankSecond, suitRankSecond] = this.cardCodeToRank(cards[1]);
      return (
        valueRankFirst > valueRankToBeat ||
        (valueRankFirst === valueRankToBeat && (suitRankFirst === 4 || suitRankSecond === 4))
      );
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
    const fiveCardsRankToBeat =
      BigTwoGame.fiveCardsRank[this.currentRound.cardsToBeatTypeIfFiveCard];
    const fiveCardsRankCurrPlayer = BigTwoGame.fiveCardsRank[this.cardsTypeIfFiveCard];

    if (fiveCardsRankCurrPlayer !== fiveCardsRankToBeat) {
      return fiveCardsRankCurrPlayer > fiveCardsRankToBeat;
    }

    [this.currentRound.cardsToBeat, this.cards].forEach((codesArr) =>
      BigTwoGame.sortCodesArr("value", codesArr)
    );

    if (fiveCardsRankToBeat === 1 || fiveCardsRankToBeat === 5) {
      // Comparing straights flushes and straights
      return this.validBeatsOpponent1Or2Cards(1, this.cards[4], this.currentRound.cardsToBeat[4]);
    } else if (fiveCardsRankToBeat === 2) {
      // Comparing flushes
      const suitsRankToBeat = BigTwoGame.suitsRank[this.currentRound.cardsToBeat[0][1]];
      const suitsRankCurrPlayer = BigTwoGame.suitsRank[this.cards[0][1]];

      if (suitsRankCurrPlayer !== suitsRankToBeat) {
        return suitsRankCurrPlayer > suitsRankToBeat;
      }
      return (
        BigTwoGame.valuesRank[this.cards[4][0]] >
        BigTwoGame.valuesRank[this.currentRound.cardsToBeat[4][0]]
      );
    } else if (fiveCardsRankToBeat === 3) {
      // Comparing full houses
      return this.validBeatsOpponent1Or2Cards(
        1,
        this.getTriple(this.cards),
        this.getTriple(this.currentRound.cardsToBeat)
      );
    } else {
      // Comparing four of a kinds
      return this.validBeatsOpponent1Or2Cards(
        1,
        this.getQuadruple(this.cards),
        this.getQuadruple(this.currentRound.cardsToBeat)
      );
    }
  }
}

class Round {
  constructor(type, turn) {
    this.type = type; // Takes the value "first" or "normal"
    this.turn = turn; // Takes the player IDs
    this.isFirstTurn = true;
    this.numPasses = 0;
    this.cardsToBeat;
    this.cardsToBeatTypeIfFiveCard;
    this.numCardsAllowed;
  }

  addToPlayingPile(cardsArr) {
    // Remove anything that's in prev turn
    previousTurnContainer.querySelectorAll(".cards").forEach((cardElm) => cardElm.remove());

    // If anything in current turn, push it to previous turn,
    currentTurnContainer
      .querySelectorAll(".cards")
      .forEach((cardElm) => previousTurnContainer.appendChild(cardElm));

    // Sort and add set of cards to current turn
    BigTwoGame.sortCodesArr("value", cardsArr);
    cardsArr.forEach((cardCode) => {
      currentTurnContainer.appendChild(document.querySelector(`[id="${cardCode}"]`));
    });

    // Setting for next turn and checking if we have a winner
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
    } else {
      this.setTurnForNextPlayer();
    }
  }

  foundWinningPlayer() {
    // returns undefined if no winner yet, else return player ID
    return players.find((player) => playerNumCardsThrown[player] === 13);
  }

  setTurnForNextPlayer() {
    this.turn = players[(players.indexOf(this.turn) + 1) % 4];
    if (this.numPasses < 3) {
      console.log(`It is now ${playersToPlayerNamesMapping[this.turn]}'s turn!`);
      this.setInstructionsInDOM(`It is now ${playersToPlayerNamesMapping[this.turn]}'s turn!`);
    }
  }

  startRound() {
    if (this.type === "first") {
      this.setInstructionsInDOM(
        `${
          playersToPlayerNamesMapping[this.turn]
        } is holding the 3 of Diamonds and\nshould start the game.`
      );
    } else {
      this.setInstructionsInDOM(
        `Everyone passed after ${playersToPlayerNamesMapping[this.turn]}'s previous turn,\nso ${
          playersToPlayerNamesMapping[this.turn]
        } is free to start a new round!`
      );
      const cardsNodes = playingPileContainer.querySelectorAll("[class$='holding cards']");
      const cardsArr = [...cardsNodes].map((elm) => elm.id);
      // Remove previous round cards from playing pile in DOM
      cardsArr.forEach((cardCode) => {
        const imgElm = document.querySelector(`[id="${cardCode}"]`);
        imgElm.remove();
      });
    }
  }

  setInstructionsInDOM(msg) {
    instructionsContainer.innerText = msg;
  }
}

class BigTwoGame {
  static suitsRank = {
    D: 1,
    C: 2,
    H: 3,
    S: 4,
  };

  static valuesRank = {
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    0: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
    2: 15,
  };

  static fiveCardsRank = {
    // Comments explain how to determine validity if both sets are in the same rank
    straight: 1, // Take largest card for both and compare as single cards
    flush: 2, // Look at suit rank, if same suit then take take largest card for both and compare as single cards
    fullhouse: 3, // Look at triple card value
    fourofakind: 4, // Look at quadruple card value
    straightflush: 5, // Same as straight
  };

  constructor() {
    this.currentRound;
    this.ownerOf3D;
    this.orderMapping = {};
  }

  async distributeCards() {
    // Shuffle and draw all cards
    await fetchDataAsync(urlShuffle);
    const data = await fetchDataAsync(urlDraw);
    const allCards = data.cards;

    // Distribute cards to players
    for (const [index, player] of players.entries()) {
      const quarterOfCards = allCards.slice(index * 13, (index + 1) * 13);
      const container = document.querySelector(`#${player}-hand-container`);

      // Create card objects in DOM
      quarterOfCards.forEach((cardObj) => {
        if (cardObj.code === "3D") {
          this.ownerOf3D = player;
        }
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

  static sortCodesArr(type, codesArr) {
    if (type === "value") {
      codesArr.sort((a, b) => BigTwoGame.suitsRank[a[1]] - BigTwoGame.suitsRank[b[1]]);
      codesArr.sort((a, b) => BigTwoGame.valuesRank[a[0]] - BigTwoGame.valuesRank[b[0]]);
    } else {
      codesArr.sort((a, b) => BigTwoGame.valuesRank[a[0]] - BigTwoGame.valuesRank[b[0]]);
      codesArr.sort((a, b) => BigTwoGame.suitsRank[a[1]] - BigTwoGame.suitsRank[b[1]]);
    }
  }

  sortCards(type, event) {
    const imgNodeList = event.target.parentNode.parentNode.querySelectorAll(
      "[class$='holding cards']"
    );
    const codesOfCurrentOrder = [...imgNodeList].map((imgElm) => imgElm.id);
    const copyOfCodesToSort = [...codesOfCurrentOrder];
    BigTwoGame.sortCodesArr(type, copyOfCodesToSort);

    codesOfCurrentOrder.forEach((code) => {
      this.orderMapping[code] = copyOfCodesToSort.indexOf(code);
    });

    // Reordering the cards using order attribute of flexbox
    imgNodeList.forEach((imgElm) => {
      imgElm.style.order = this.orderMapping[imgElm.id];
    });
  }

  toggleCardSelection(event) {
    const cardElm = event.target;
    // Return if not player's turn
    if (cardElm.className !== `${this.currentRound.turn}-holding cards`) {
      return;
    }

    // If card is not selected, select it, if it's select then unselect it.
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

    const idOfPlayerHittingButton = event.target.parentNode.parentNode.parentNode.id;
    const nameOfPlayerHittingButton = playersToPlayerNamesMapping[idOfPlayerHittingButton];
    if (idOfPlayerHittingButton !== this.currentRound.turn) {
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
      this.currentRound.numPasses += 1;
      this.currentRound.setTurnForNextPlayer();

      // Start a new round when there are three consecutive passes
      if (this.currentRound.numPasses === 3) {
        this.currentRound = new Round("normal", this.currentRound.turn);
        this.currentRound.startRound();
      }
    } else {
      // Here, action === "play"
      const checkValidity = new Valid(selectedCardsCodes, this.currentRound);
      let toCheck;
      if (this.currentRound.isFirstTurn) {
        toCheck = checkValidity.validFirstTurn();
      } else {
        toCheck = checkValidity.validGenericTurn();
      }

      if (toCheck.validTurn) {
        this.currentRound.addToPlayingPile(selectedCardsCodes);
        // Reset to 0
        this.currentRound.numPasses = 0;
      } else {
        this.currentRound.setInstructionsInDOM(`${toCheck.message}, ${nameOfPlayerHittingButton}!`);
      }
    }
  }

  async startGame() {
    await this.distributeCards();
    this.currentRound = new Round("first", this.ownerOf3D);
    this.currentRound.startRound();

    // Event listeners for sorting buttons
    document.querySelectorAll(".sort-number").forEach((sortNumButton) => {
      sortNumButton.addEventListener("click", (event) => this.sortCards("value", event));
    });

    document.querySelectorAll(".sort-suit").forEach((sortSuitButton) => {
      sortSuitButton.addEventListener("click", (event) => this.sortCards("suit", event));
    });

    // Event listeners for card selection
    document.querySelectorAll(".hand-container").forEach((handCardsContainer) => {
      handCardsContainer.addEventListener("click", (event) => this.toggleCardSelection(event));
    });

    // Event listeners for pass and play buttons.
    document.querySelectorAll(".pass").forEach((passButton) => {
      passButton.addEventListener("click", (event) => this.checkValidAction("pass", event));
    });

    document.querySelectorAll(".play").forEach((playButton) => {
      playButton.addEventListener("click", (event) => this.checkValidAction("play", event));
    });
  }
}

newGame = new BigTwoGame();
newGame.startGame();

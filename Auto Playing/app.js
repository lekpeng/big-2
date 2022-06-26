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

class Computer {
  constructor(id) {
    this.id = id;
    this.cardCodes;
    this.singleCardCodes = [];
    this.doubleCardCodes = [];
    this.fiveCardCodes = {
      straightflush: [],
      fourofakind: [],
      fullhouse: [],
      flush: [],
      straight: [],
    };
    this.passButton = document.querySelector(`#${id}`).querySelector(".pass");
    this.playButton = document.querySelector(`#${id}`).querySelector(".play");
  }

  getCardCodes() {
    const cardNodes = document.querySelectorAll(`.${this.id}-holding`);
    this.cardCodes = [...cardNodes].map((card) => card.id);
    BigTwoGame.sortCodesArr("value", this.cardCodes);
  }

  partition() {
    this.findStraightFlush();
    this.findFourOfAKind();
    this.findFullHouse();
    this.findFlush();
    this.findStraight();
    this.findDoubles();
    this.singleCardCodes = this.cardCodes.map((code) => [code]);
    this.cardCodes = [];
  }

  pass() {
    this.passButton.click();
  }

  determineAction(cardsToBeat = null, cardsToBeatTypeIfFiveCard = null) {
    if (!cardsToBeat) {
      // first round first turn
      const cardCodes = this.find3Diamonds();
      this.select(cardCodes);
      this.play();
    }
  }

  find3Diamonds() {
    if (this.singleCardCodes.length && this.singleCardCodes[0].indexOf("3D") > -1) {
      return this.singleCardCodes.shift();
    } else if (this.doubleCardCodes.length && this.doubleCardCodes[0].indexOf("3D") > -1) {
      return this.doubleCardCodes.shift();
    } else {
      for (const type in this.fiveCardCodes) {
        if (this.fiveCardCodes[type].length && this.fiveCardCodes[type][0].indexOf("3D") > -1) {
          return this.fiveCardCodes[type].shift();
        }
      }
    }
  }

  select(cardCodes) {
    console.log("selected card codes", cardCodes);
    cardCodes.forEach((cardCode) => {
      const elm = document.querySelector(`[id="${cardCode}"]`);
      elm.click();
    });
  }

  play() {
    this.playButton.click();
  }

  removeCodesFromArr(codesToRemove) {
    codesToRemove.forEach((code) => {
      this.cardCodes.splice(this.cardCodes.indexOf(code), 1);
    });
  }

  findSameValues(numSame, arr = this.cardCodes) {
    let bool = false;
    let found = [];

    const limit = arr.length - numSame + 1;

    for (let i = 0; i < limit; i++) {
      const valueToCompare = arr[i][0];
      if (arr.slice(i + 1, i + numSame).every((code) => code[0] === valueToCompare)) {
        bool = true;
        found = arr.slice(i, i + numSame);
        this.removeCodesFromArr(found);
        break;
      }
    }
    return { bool: bool, found: found };
  }

  findDoubles() {
    let doubles = this.findSameValues(2);
    while (doubles.bool) {
      this.doubleCardCodes.push(doubles.found);
      doubles = this.findSameValues(2);
    }
  }

  findStraightFlush() {
    let divideBySuits = { D: [], C: [], H: [], S: [] };
    this.cardCodes.forEach((code) => divideBySuits[code[1]].push(code));

    for (let key in divideBySuits) {
      const suitLength = divideBySuits[key].length;
      if (suitLength >= 5) {
        const suitArr = divideBySuits[key];
        for (let i = 0; i < suitLength; i++) {
          const startOfStraightFlush = suitArr[i];
          const possibleStraightFlush = [];
          const valueRankOfStart = BigTwoGame.valuesRank[startOfStraightFlush[0]];
          const desiredVals = [...Array(4).keys()]
            .map((i) => i + 1 + valueRankOfStart)
            .map((value) => BigTwoGame.valuesRankReversed[value]);

          for (const desiredVal of desiredVals) {
            const singleCodeFound = suitArr.find((code) => code[0] === desiredVal);
            if (!singleCodeFound) {
              break;
            }
            possibleStraightFlush.push(singleCodeFound);
          }

          if (possibleStraightFlush.length === 4) {
            const straightFlush = [startOfStraightFlush, ...possibleStraightFlush];
            this.fiveCardCodes.straightflush.push(straightFlush);
            this.removeCodesFromArr(straightFlush);
            break;
          }
        }
      }
    }
  }

  findFourOfAKind() {
    const checkQuadruple = this.findSameValues(4);
    if (checkQuadruple.bool) {
      const fourOfAKind = [this.cardCodes[0], ...checkQuadruple.found];
      this.fiveCardCodes.fourofakind.push(fourOfAKind);
      this.removeCodesFromArr([this.cardCodes[0]]);
    } else {
      // return the quadruple
      checkQuadruple.found.forEach((single) => {
        this.cardCodes.push(single);
      });
      BigTwoGame.sortCodesArr("value", this.cardCodes);
    }
  }

  findFullHouse() {
    const checkTriple = this.findSameValues(3);
    if (checkTriple.bool) {
      const checkDouble = this.findSameValues(2);
      if (checkDouble.bool) {
        this.fiveCardCodes.fullhouse.push([...checkDouble.found, ...checkTriple.found]);
        // console.log("this.fiveCardCodes", this.id, this.fiveCardCodes);
      } else {
        // return the triple
        checkTriple.found.forEach((single) => {
          this.cardCodes.push(single);
        });
        BigTwoGame.sortCodesArr("value", this.cardCodes);
      }
    }
  }

  findFlush() {
    let divideBySuits = { D: [], C: [], H: [], S: [] };
    this.cardCodes.forEach((code) => divideBySuits[code[1]].push(code));

    for (let key in divideBySuits) {
      if (divideBySuits[key].length >= 5) {
        const flushCards = divideBySuits[key].slice(0, 5);
        this.fiveCardCodes.flush.push(flushCards);
        // console.log("flushCards", this.id, flushCards);
        // console.log("this.fiveCardCodes.flush", this.id, this.fiveCardCodes.flush);
        this.removeCodesFromArr(flushCards);
        break;
      }
    }
  }

  findStraight() {
    const arrLength = this.cardCodes.length;
    for (let i = 0; i < arrLength; i++) {
      const startOfStraight = this.cardCodes[i];
      const possibleStraight = [];
      const valueRankOfStart = BigTwoGame.valuesRank[startOfStraight[0]];
      const desiredVals = [...Array(4).keys()]
        .map((i) => i + 1 + valueRankOfStart)
        .map((value) => BigTwoGame.valuesRankReversed[value]);

      for (const desiredVal of desiredVals) {
        const singleCodeFound = this.cardCodes.find((code) => code[0] === desiredVal);
        if (!singleCodeFound) {
          break;
        }
        possibleStraight.push(singleCodeFound);
      }

      if (possibleStraight.length === 4) {
        const straight = [startOfStraight, ...possibleStraight];
        this.fiveCardCodes.straight.push(straight);
        this.removeCodesFromArr(straight);
        break;
      }
    }
  }
}

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
      return valueRankFirst > valueRankToBeat || suitRankFirst === 4 || suitRankSecond === 4;
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
  constructor(type, turn, computers) {
    this.type = type; // Takes the value "first" or "normal"
    this.turn = turn; // Takes the player IDs
    this.isFirstTurn = true;
    this.numPasses = 0;
    this.cardsToBeat;
    this.cardsToBeatTypeIfFiveCard;
    this.numCardsAllowed;
    this.computers = computers;
  }
  // WAIT FUNCTION

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
  }

  addToPlayingPile(cardsArr) {
    // Remove anything that's in prev turn
    previousTurnContainer.querySelectorAll(".cards").forEach((card) => card.remove());

    // If anything in current turn, push it to previous turn,
    currentTurnContainer
      .querySelectorAll(".cards")
      .forEach((card) => previousTurnContainer.appendChild(card));

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

  async setTurnForNextPlayer() {
    this.turn = players[(players.indexOf(this.turn) + 1) % 4];
    await this.setInstructionsInDOM(`It is now ${playersToPlayerNamesMapping[this.turn]}'s turn!`);
  }

  async startRound() {
    // Message
    if (this.type === "first") {
      await this.setInstructionsInDOM(
        `${
          playersToPlayerNamesMapping[this.turn]
        } is holding the 3 of Diamonds and\nshould start the game.`
      );
    } else {
      await this.setInstructionsInDOM(
        `Everyone passed after ${playersToPlayerNamesMapping[this.turn]}'s previous turn,\nso ${
          playersToPlayerNamesMapping[this.turn]
        } is free to start a new round!`
      );
      // Remove previous round cards from playing pile in DOM
      playingPileContainer.querySelectorAll(".cards").forEach((card) => card.remove());
    }
    // Make computer start
    if (this.turn !== "player") {
      console.log("this.computers[this.turn]", this.computers[this.turn]);
      this.computers[this.turn].determineAction();
    }
  }

  async setInstructionsInDOM(msg) {
    instructionsContainer.innerText = msg;
    await this.sleep(5);
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

  static valuesRankReversed = this.reverseKeysAndValuesOfObj(this.valuesRank);

  static reverseKeysAndValuesOfObj(obj) {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      newObj[obj[key]] = key;
    });
    return newObj;
  }

  constructor() {
    this.currentRound;
    this.ownerOf3D;
    this.computers = {};
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
    const cardNodes = event.target.parentNode.parentNode.querySelectorAll(".cards");
    const codesOfCurrentOrder = [...cardNodes].map((card) => card.id);
    const copyOfCodesToSort = [...codesOfCurrentOrder];
    BigTwoGame.sortCodesArr(type, copyOfCodesToSort);

    codesOfCurrentOrder.forEach((code) => {
      this.orderMapping[code] = copyOfCodesToSort.indexOf(code);
    });

    // Reordering the cards using order attribute of flexbox
    cardNodes.forEach((card) => {
      card.style.order = this.orderMapping[card.id];
    });
  }

  toggleCardSelection(event) {
    console.log("HELLO");
    const card = event.target;
    // Return if not player's turn
    if (card.className !== `${this.currentRound.turn}-holding cards`) {
      return;
    }

    // If card is not selected, select it, if it's select then unselect it.
    if (!card.title || card.title === "unselected") {
      card.title = "selected";
    } else {
      card.title = "unselected";
    }
  }

  checkValidAction(action, event) {
    const selectedCardsCodes = [...document.querySelectorAll("[title='selected']")].map(
      (card) => card.id
    );

    selectedCardsCodes.forEach((cardCode) => {
      document.querySelector(`[id="${cardCode}"]`).title = "unselected";
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
      this.currentRound.setTurnForNextPlayer();
      this.currentRound.numPasses += 1;

      // Start a new round when there are three consecutive passes
      if (this.currentRound.numPasses === 3) {
        this.currentRound = new Round("normal", this.currentRound.turn, this.computers);
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

    players.forEach((id) => {
      if (id.split("-")[0] === "com") {
        const computer = new Computer(id);
        computer.getCardCodes();
        computer.partition();
        console.log(id, computer);
        console.log(
          computer.singleCardCodes.length +
            computer.doubleCardCodes.length * 2 +
            computer.fiveCardCodes.straight.length * 5 +
            computer.fiveCardCodes.flush.length * 5 +
            computer.fiveCardCodes.fullhouse.length * 5 +
            computer.fiveCardCodes.fourofakind.length * 5 +
            computer.fiveCardCodes.straightflush.length * 5
        );
        this.computers[id] = computer;
      }
    });

    this.currentRound = new Round("first", this.ownerOf3D, this.computers);
    this.currentRound.startRound();
  }
}

newGame = new BigTwoGame();
newGame.startGame();

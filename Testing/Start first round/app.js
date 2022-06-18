// Names of players and cards
const players = ["playerHand", "com1Hand", "com2Hand", "com3Hand"];
const playerHandsCodesOnly = {}; //array of card objects
const playerHands = {}; //array of card codes strings

// DOM ELEMENTS
const instructionsDiv = document.querySelector("#instructions");
const handCardsContainers = document.querySelectorAll(".hand-cards");
const playingPileCards = document.querySelector("#playingPileCards");

class Valid {
  constructor(cards, currentRound, type = "normal") {
    //cards here is an array of the codes...
    this.cards = cards;
    this.num = cards.length;
    this.type = type;
    this.currentRound = currentRound;
  }

  validFirstTurn() {
    console.log("type", this.type);
    console.log("checking valid first turn");
    console.log("current round", this.currentRound);
    if (this.type === "first") {
      return this.validCount() && this.cards.includes("3D") && this.validCards();
    }
    console.log("validCount", this.validCount());
    console.log("validCards", this.validCards());
    return this.validCount() && this.validCards();
  }

  validGenericTurn() {
    console.log("checking valid generic turn");
    console.log("current round", this.currentRound);
    return (
      this.num === this.currentRound.numCardsAllowed &&
      this.validCards() &&
      this.validBeatsOpponent()
    );
  }

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

  // DOES IT BEAT OPPONENT?
  cardCodeToRank(code) {
    let value, suit;
    const codeArr = code.split("");
    [value, suit] = codeArr;

    const rank = codeArr.map((item) => {
      if (item === value) {
        return valueRank[value];
      }
      return suitsRank[suit];
    });

    return rank;
  }

  validBeatsOpponent() {
    let valueToBeatRank, suitToBeatRank;
    [valueToBeatRank, suitToBeatRank] = this.cardCodeToRank(this.currentRound.cardsToBeat[0]);

    let valueRank, suitRank;
    [valueRank, suitRank] = this.cardCodeToRank(this.cards[0]);

    if (this.num === 1) {
      return (
        valueRank > valueToBeatRank || (valueRank === valueToBeatRank && suitRank > suitToBeatRank)
      );
    }

    if (this.num === 2) {
      let valueRankSecond, suitRankSecond;
      [valueRankSecond, suitRankSecond] = this.cardCodeToRank(this.cards[1]);
      return valueRank > valueToBeatRank || suitRank === 4 || suitRankSecond === 4;
    }
  }
}

class Round {
  constructor(type, turn = null) {
    this.type = type; //is it a first round where 3D must be used or not?
    this.turn = turn; //whose turn
    this.isAnyCardPlayed = false;
    this.numPasses = 0;
    this.cardsToBeat;
    this.numCardsAllowed;
  }
  addToPlayingPile(cardsArr) {
    addCardsToPlayingPile(cardsArr);
    if (!this.isAnyCardPlayed) {
      this.isAnyCardPlayed = true;
      this.numCardsAllowed = cardsArr.length;
      console.log("num cards allowed", this.numCardsAllowed);
    }

    this.cardsToBeat = cardsArr;
    this.setTurnForNextPlayer();
  }

  setTurnForNextPlayer() {
    const currIndex = players.indexOf(this.turn);
    this.turn = players[(currIndex + 1) % 4];
    this.setInstructionsInDOM(`It is now ${this.turn}'s turn!`);
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
        `${this.turn} is holding the 3 of Diamonds and should start the game`
      );
    } else {
      //CLEAR CARDS
      this.setInstructionsInDOM(
        `Since everyone passed during ${this.turn}'s turn. ${this.turn} is free to start any card combi`
      );
      const cardsNodes = playingPileCards.querySelectorAll("[class$='holding cards']");
      const cardsArr = [...cardsNodes].map((elm) => elm.id);
      discardPlayingPile(cardsArr);
    }
  }

  setInstructionsInDOM(msg) {
    instructionsDiv.innerText = msg;
  }
}

class BigTwoGame {
  constructor() {
    this.currentRound;
  }

  // boundToggleCardSelection = (event) => this.toggleCardSelection(event);
  toggleCardSelection(event) {
    const cardElm = event.target;
    // return if not player's turn or player clicked on something that's not a card?
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
  proceedWithAdditionToPile(selectedCardsCodes) {
    this.currentRound.addToPlayingPile(selectedCardsCodes);
    selectedCardsCodes.forEach((code) => {
      document.querySelector(`[id="${code}"]`).title = "unselected";
    });
  }

  checkValidAction(action, event) {
    const selectedCardsCodes = [...document.querySelectorAll(".cards[title='selected']")].map(
      (cardImgElm) => cardImgElm.id
    );

    // console.log("selectedCards", selectedCardsCodes);
    if (event.target.parentNode.id !== this.currentRound.turn) {
      console.log("not your turn bodoh");
      // not player's turn
      return;
    }
    if (this.currentRound.type === "first" && !this.currentRound.isAnyCardPlayed) {
      if (action === "pass") {
        // player with 3D cannot pass
        console.log("player with 3D cannot pass");
      } else {
        const checkValidity = new Valid(selectedCardsCodes, this.currentRound, "first");
        if (checkValidity.validFirstTurn()) {
          this.proceedWithAdditionToPile(selectedCardsCodes);
        } else {
          console.log("this is invalid");
        }
      }
    } else if (!this.currentRound.isAnyCardPlayed) {
      if (action === "pass") {
        console.log("first player of the round cannot pass");
      } else {
        const checkValidity = new Valid(selectedCardsCodes, this.currentRound);
        if (checkValidity.validFirstTurn()) {
          this.proceedWithAdditionToPile(selectedCardsCodes);
        } else {
          console.log("this is invalid for else if");
        }
      }
    } else {
      if (action === "pass") {
        this.currentRound.setTurnForNextPlayer();
        this.currentRound.numPasses += 1;
        if (this.currentRound.numPasses === 3) {
          this.currentRound = new Round("normal", this.currentRound.turn);
          this.currentRound.startRound();
        }
      } else {
        this.currentRound.numPasses = 0;
        const checkValidity = new Valid(selectedCardsCodes, this.currentRound);
        if (checkValidity.validGenericTurn()) {
          this.proceedWithAdditionToPile(selectedCardsCodes);
        } else {
          console.log("this is invalid non first round");
        }
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

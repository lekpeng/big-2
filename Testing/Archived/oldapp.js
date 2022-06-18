// CONSIDER PUTTING PLAYER'S CARDS IN PILES AS WELL SO CAN JUST ADD TO DISCARD PILE WITHOUT HAVING TO PUSH AND POP ARRAY

//DeckID
const deckID = "tyu78tcx00jy";

//Function to fetch data via API
async function fetchDataAsync(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

class cardHand {
  static suitsRank = {
    DIAMONDS: 1,
    CLUBS: 2,
    HEARTS: 3,
    SPADES: 4,
  };

  static valueRank = {
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    JACK: 11,
    QUEEN: 12,
    KING: 13,
    ACE: 14,
    2: 15,
  };

  constructor(cards, owner) {
    this.cards = cards;
    this.owner = owner;
  }

  sortHandByNumber() {
    this.cards.sort((a, b) => cardHand.suitsRank[a.suit] - cardHand.suitsRank[b.suit]);
    this.cards.sort((a, b) => cardHand.valueRank[a.value] - cardHand.valueRank[b.value]);
    console.log(this.cards);
  }

  sortHandBySuit() {
    this.cards.sort((a, b) => cardHand.valueRank[a.value] - cardHand.valueRank[b.value]);
    this.cards.sort((a, b) => cardHand.suitsRank[a.suit] - cardHand.suitsRank[b.suit]);
    console.log(this.cards);
  }

  // FUNCTIONS FOR COMPUTERS TO PLAY
  checkDoubles() {
    // to return cards if exist, else return false
  }

  checkStraightFlush() {
    // to return cards if exist, else return false
  }

  checkFourOfAKind() {
    // to return cards if exist, else return false
  }

  checkFullHouse() {
    // to return cards if exist, else return false
  }

  checkFlush() {
    // to return cards if exist, else return false
  }

  checkStraight() {
    // to return cards if exist, else return false
  }
}

class round {
  constructor(whoseTurn = null, pilename, playerHand, com1Hand, com2Hand, com3Hand) {
    this.whoseTurn = whoseTurn;
    this.playerHand = playerHand;
    this.computer1Hand = com1Hand;
    this.computer2Hand = com2Hand;
    this.computer3Hand = com3Hand;
    this.pilename = pilename;
  }

  //owner should be a string and cards should be an array of 1, 2 or 5 cards
  addToPile(owner, cards){
    `https://deckofcardsapi.com/api/deck/${deckID}/pile/${this.pilename}/add/?cards=3D`

  }

  startFirstRound() {
    const allPlayersCards = [
      this.playerHand,
      this.computer1Hand,
      this.computer2Hand,
      this.computer3Hand,
    ];
    for (hand of allPlayersCards) {
      if (hand.map((cardObj) => cardObj.code).includes("3D")) {
        return hand.owner;
      }
    }


    
  }

  continueRound()
}

class bigTwoGame {
  constructor() {
    // this.players = ["Player", "Com1", "Com2", "Com3"];
    // this.playerHand = [];
    // this.computer1Hand = [];
    // this.computer2Hand = [];
    // this.computer3Hand = [];
  }

  shuffleCards() {
    fetchDataAsync(`https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`);
  }

  distributeCards() {
    fetchDataAsync(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=52`).then((rs) => {
      const allCards = rs.cards;
      this.playerHand = new cardHand(allCards.slice(0, 13), "Player");
      this.computer1Hand = new cardHand(allCards.slice(13, 26), "Com1");
      this.computer2Hand = new cardHand(allCards.slice(26, 39), "Com2");
      this.computer3Hand = new cardHand(allCards.slice(39, 52), "Com3");
      this.playerHand.sortHandBySuit();
    });
  }

  start() {
    //distribute cards
    //initialise first round to start with player holding 3 diamonds
  }
}

newGame = new bigTwoGame();
newGame.distributeCards();

suitsRank = {
  D: 1,
  C: 2,
  H: 3,
  S: 4,
};

valuesRank = {
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

const arr1 = ["4C", "6C", "6H", "7D", "7C", "8D", "8S", "0H", "0S", "JS", "KS", "AH", "AS"];
const arr2 = ["3D", "3C", "3H", "4D", "5H", "7S", "9D", "0D", "JD", "QH", "KD", "KC", "2D"];

// first sort by number => find straight flush and four of a kind and full houses
// then sort by suit => find flush
// then sort by number => find straight
// find doubles
// the rest are singles

function findFullHouse(sortedArr) {
  let bool = false;
  let found = "";
}

function findFlush(arr) {
  let bool = false;
  let found = "";
  let divideBySuits = { D: [], C: [], H: [], S: [] };

  arr.forEach((code) => divideBySuits[divideBySuits[code[1]].push(code)]);

  for (let key in divideBySuits) {
    if (divideBySuits[key].length >= 5) {
      bool = true;
      found = divideBySuits[key].slice(0, 5);
      break;
    }
  }
  return [bool, found];
}

console.log(findFlush(arr1));

// function findStraight(sortedCardsArr) {
//   let value, suit;
//   const firstCard = (sortedCardsArr[0][(value, suit)] = [
//     valuesRank[firstCard[0]],
//     suitsRank[firstCard[1]],
//   ]);
//   const arrLength = sortedCardsArr.length;
//   const possibleStraight = [];

//   for (let i = 1; i < arrLength; i++) {
//     if (sortedCardsArr[i][0] === sortedCardsArr[i - 1][0]) {
//       continue;
//     }
//   }
// }

function partition(cardsArr) {
  let singles = [],
    doubles = [],
    fiveCards = [];

  return [singles, doubles, fiveCards];
}

function sortByValue(cardsArr) {
  cardsArr.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
  cardsArr.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
}

function sortBySuit(cardsArr) {
  cardsArr.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
  cardsArr.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
}

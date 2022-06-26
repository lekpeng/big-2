const suitsRank = {
  D: 1,
  C: 2,
  H: 3,
  S: 4,
};

const valuesRank = {
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

const valuesRankKeyReversed = {};
Object.keys(valuesRank).forEach((key) => {
  valuesRankKeyReversed[valuesRank[key]] = key;
});

const arr1 = ["4C", "6C", "6H", "7D", "7C", "8D", "8S", "0H", "0S", "JS", "KS", "AH", "AS"];
const arr2 = ["3D", "3C", "3H", "4D", "3S", "7S", "9D", "0D", "JD", "QH", "KD", "KC", "2D"];
const arr3 = ["3D", "4D", "5D", "6C", "7D", "8S", "9S", "0S", "JS", "QS", "KS", "AS", "2S"];

// sort by number

function removeCodesFromArr(arr, codesToRemove) {
  codesToRemove.forEach((code) => {
    arr.splice(arr.indexOf(code), 1);
  });
}

function findSameValues(arr, numSame) {
  let bool = false;
  let found = [];
  const limit = arr.length - numSame + 1;

  for (let i = 0; i < limit; i++) {
    const valueToCompare = arr[i][0];
    if (arr.slice(i + 1, i + numSame).every((code) => code[0] === valueToCompare)) {
      bool = true;
      found = arr.slice(i, i + numSame);
      removeCodesFromArr(arr, found);
      break;
    }
  }
  return [bool, found];
}

console.log(findSameValues(["3D", "4D", "4S", "5D"], 2));

function findDoubles(arr) {
  const allDoubles = [];
  let doubles = findSameValues(arr, 2);
  const bool = doubles[0];
  while (doubles[0]) {
    allDoubles.push(doubles[1]);
    doubles = findSameValues(arr, 2);
  }
  return [bool, allDoubles];
}

function findStraightFlush(arr) {
  let bool = false;
  let found = [];
  let divideBySuits = { D: [], C: [], H: [], S: [] };

  arr.forEach((code) => divideBySuits[code[1]].push(code));

  for (let key in divideBySuits) {
    const suitLength = divideBySuits[key].length;
    console.log(suitLength);
    if (suitLength >= 5) {
      const suitArr = divideBySuits[key];
      for (let i = 0; i < suitLength; i++) {
        const startOfStraightFlush = suitArr[i];
        const possibleStraightFlush = [];
        const valueRankOfStart = valuesRank[startOfStraightFlush[0]];
        const desiredVals = [...Array(4).keys()]
          .map((i) => i + 1 + valueRankOfStart)
          .map((value) => valuesRankKeyReversed[value]);

        for (const desiredVal of desiredVals) {
          const singleCodeFound = suitArr.find((code) => code[0] === desiredVal);
          if (!singleCodeFound) {
            break;
          }
          possibleStraightFlush.push(singleCodeFound);
        }

        if (possibleStraightFlush.length === 4) {
          bool = true;
          found.push(startOfStraightFlush, ...possibleStraightFlush);
          removeCodesFromArr(arr, found);
          break;
        }
      }
    }
  }
  return [bool, found];
}

function findFourOfAKind(arr) {
  let bool = false;
  let found = [];
  const checkQuadruple = findSameValues(arr, 4);
  if (checkQuadruple[0]) {
    bool = true;
    found.push(arr[0], ...checkQuadruple[1]);
    removeCodesFromArr(arr, [arr[0]]);
  }

  return [bool, found];
}

function findFullHouse(arr) {
  let bool = false;
  let found = [];
  const checkTriple = findSameValues(arr, 3);

  if (checkTriple[0]) {
    const checkDouble = findSameValues(arr, 2);
    if (checkDouble[0]) {
      bool = true;
      found.push(...checkDouble[1], ...checkTriple[1]);
    }
  }
  return [bool, found];
}

function findFlush(arr) {
  let bool = false;
  let found = [];
  let divideBySuits = { D: [], C: [], H: [], S: [] };

  arr.forEach((code) => divideBySuits[code[1]].push(code));

  for (let key in divideBySuits) {
    if (divideBySuits[key].length >= 5) {
      bool = true;
      found = divideBySuits[key].slice(0, 5);
      removeCodesFromArr(arr, found);
      break;
    }
  }

  return [bool, found];
}

function findStraight(arr) {
  let bool = false;
  let found = [];
  const arrLength = arr.length;
  for (let i = 0; i < arrLength; i++) {
    const startOfStraight = arr[i];
    const possibleStraight = [];
    const valueRankOfStart = valuesRank[startOfStraight[0]];
    const desiredVals = [...Array(4).keys()]
      .map((i) => i + 1 + valueRankOfStart)
      .map((value) => valuesRankKeyReversed[value]);

    for (const desiredVal of desiredVals) {
      const singleCodeFound = arr.find((code) => code[0] === desiredVal);
      if (!singleCodeFound) {
        break;
      }
      possibleStraight.push(singleCodeFound);
    }

    if (possibleStraight.length === 4) {
      bool = true;
      found.push(startOfStraight, ...possibleStraight);
      removeCodesFromArr(arr, found);
      break;
    }
  }
  return [bool, found];
}

function partition(cardsArr) {
  let singles = [],
    doubles = [],
    fiveCards = { straightflush: [], fourofakind: [], fullhouse: [], flush: [], straight: [] };

  sortByValue(cardsArr);
  const findCardCombisFuncs = {
    straightflush: findStraightFlush,
    fourofakind: findFourOfAKind,
    fullhouse: findFullHouse,
    flush: findFlush,
    straight: findStraight,
    doubles: findDoubles,
  };

  Object.keys(findCardCombisFuncs).forEach((type) => {
    const performFunc = findCardCombisFuncs[type](cardsArr);
    if (performFunc[0]) {
      if (performFunc[1].length === 5) {
        fiveCards[type].push(performFunc[1]);
      } else {
        doubles = performFunc[1];
      }
    }
  });

  singles = cardsArr;

  return { "single cards": singles, "double cards": doubles, "five cards": fiveCards };
}

function sortByValue(cardsArr) {
  cardsArr.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
  cardsArr.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
}

function sortBySuit(cardsArr) {
  cardsArr.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
  cardsArr.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
}

// arr1.sort(() => Math.random() - 0.5);
// arr2.sort(() => Math.random() - 0.5);
// arr3.sort(() => Math.random() - 0.5);

// console.log(partition(arr1));
// console.log(partition(arr2));
// console.log(partition(arr3));

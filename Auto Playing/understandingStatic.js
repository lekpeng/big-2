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

  static valuesRankReversed = this.reverseKeysAndValuesOfObj(this.valuesRank);

  static reverseKeysAndValuesOfObj(obj) {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      newObj[obj[key]] = key;
    });
    return newObj;
  }
}

console.log(BigTwoGame.valuesRankReversed);

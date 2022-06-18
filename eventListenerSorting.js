const orderMapping = {}; // for ordering cards in sorting

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

document.querySelectorAll(".sort-number").forEach((sortNumButton) => {
  sortNumButton.addEventListener("click", (event) => sortCards("num", event));
});

document.querySelectorAll(".sort-suit").forEach((sortSuitButton) => {
  sortSuitButton.addEventListener("click", (event) => sortCards("suit", event));
});

function sortCards(type, event) {
  const imgNodeList = event.target.parentNode.querySelectorAll("[class$='holding cards']");
  const codesOfCurrentOrder = [...imgNodeList].map((imgElm) => imgElm.id);
  const copyOfCodesToSort = [...codesOfCurrentOrder];

  if (type === "suit") {
    // sort by values then suits
    copyOfCodesToSort.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
    copyOfCodesToSort.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
  } else {
    // sort by suits then values
    copyOfCodesToSort.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
    copyOfCodesToSort.sort((a, b) => valuesRank[a[0]] - valuesRank[b[0]]);
  }

  codesOfCurrentOrder.forEach((code) => {
    orderMapping[code] = copyOfCodesToSort.indexOf(code);
  });

  // reordering the cards using order attribute of flexbox
  imgNodeList.forEach((imgElm) => {
    imgElm.style.order = orderMapping[imgElm.id];
  });
}

// EVENT LISTENERS FOR SORTING
const orderMapping = {};

suitsRank = {
  D: 1,
  C: 2,
  H: 3,
  S: 4,
};

valueRank = {
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
  const imagesArray = document.querySelectorAll(
    `.${event.target.parentNode.id}-holding`
  ); //nodes actually, not array

  const codesOfCurrentOrder = [...imagesArray].map((imgElm) => imgElm.id);
  const copyOfCodesToSort = [...codesOfCurrentOrder];

  if (type === "suit") {
    copyOfCodesToSort.sort((a, b) => valueRank[a[0]] - valueRank[b[0]]);
    copyOfCodesToSort.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
  } else {
    copyOfCodesToSort.sort((a, b) => suitsRank[a[1]] - suitsRank[b[1]]);
    copyOfCodesToSort.sort((a, b) => valueRank[a[0]] - valueRank[b[0]]);
  }

  codesOfCurrentOrder.forEach((code) => {
    orderMapping[code] = parseInt(copyOfCodesToSort.indexOf(code));
  });

  imagesArray.forEach((imgElm) => {
    imgElm.style.order = orderMapping[imgElm.id];
  });
}

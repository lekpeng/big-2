const x = {
  straight: [
    [1, 2, "3D", 4, 5],
    [4, 5, 6, 7, 8],
  ],
  flush: [],
};

Object.keys(x).forEach((type) => {
  console.log("type", type, x[type]);
  if (x[type].length && x[type][0].indexOf("3D") > -1) {
    console.log(x[type].shift());
  }
});

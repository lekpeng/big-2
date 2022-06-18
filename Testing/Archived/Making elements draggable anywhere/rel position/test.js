console.log("hello");
let mousePosition;
let offset = [0, 0];
let isDown = false;

const div = document.querySelector("#move");
const container = document.querySelector("#container");

div.addEventListener(
  "pointerdown",
  function (e) {
    isDown = true;
    offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
  },
  true
);

document.addEventListener(
  "pointerup",
  function () {
    isDown = false;
  },
  true
);

document.addEventListener(
  "pointermove",
  function (event) {
    event.preventDefault();
    if (isDown) {
      mousePosition = {
        //horizontal coordinate of the mouse
        x: event.clientX,
        //vertical coordinate of the mouse
        y: event.clientY,
      };

      const styleLeft = mousePosition.x + offset[0];
      const styleTop = mousePosition.y + offset[1];

      div.style.left = styleLeft + "px";
      div.style.top = styleTop + "px";
    }
  },
  true
);

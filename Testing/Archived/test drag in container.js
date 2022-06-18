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
    offset = [
      div.offsetLeft -
        Math.min(e.clientX, container.offsetLeft + container.clientWidth) -
        (div.offsetLeft + div.clientWidth - e.clientX + container.offsetLeft),
      div.offsetTop -
        Math.min(e.clientY, container.offsetTop + container.clientHeight) -
        (div.offsetTop + div.clientHeight - e.clientY + container.offsetTop),
    ];
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
        x: Math.min(event.clientX, container.offsetLeft + container.clientWidth),
        //vertical coordinate of the mouse
        y: Math.min(event.clientY, container.offsetTop + container.clientHeight),
      };

      div.style.left = mousePosition.x + offset[0] + "px";
      div.style.top = mousePosition.y + offset[1] + "px";
    }
  },
  true
);

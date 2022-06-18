let mousePosition;
let offset = [0, 0];
let isDown = false;

function findPos(obj) {
  let curleft = (curtop = 0);
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    // console.log("cur values", [curleft, curtop]);
    return [curleft - 8, curtop - 8];
  }
}

const div = document.querySelector("#move");
const container = document.querySelector("#container");

div.addEventListener(
  "pointerdown",
  function (e) {
    isDown = true;
    offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
    console.log("offset", offset);
    const findPosItemArr = findPos(div);
    offsetRelative = [findPosItemArr[0] - e.clientX, findPosItemArr[1] - e.clientY];
    console.log("offsetRelative", offsetRelative);
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

      const findPosItemArr = findPos(div);
      const styleLeft = Math.min(
        mousePosition.x + offsetRelative[0]
        // container.clientWidth - div.clientWidth
      );
      const styleTop = Math.min(
        mousePosition.y + offsetRelative[1]
        // container.clientHeight - div.clientHeight
      );

      div.style.left = styleLeft + "px";
      div.style.top = styleTop + "px";
    }
  },
  true
);

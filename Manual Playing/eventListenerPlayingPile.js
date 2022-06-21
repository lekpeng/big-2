function makeCardMovableInPlayingPile(cardElm) {
  let active = false,
    xOffset = 0,
    yOffset = 0;

  let currentX, currentY, initialX, initialY;

  playingPileContainer.addEventListener("pointerdown", dragStart, false);
  playingPileContainer.addEventListener("pointerup", dragEnd, false);
  playingPileContainer.addEventListener("pointermove", drag, false);

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === cardElm) {
      active = true;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    active = false;
  }

  function drag(e) {
    if (active) {
      e.preventDefault();

      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, cardElm);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
}

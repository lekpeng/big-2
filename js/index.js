const submitButton = document.querySelector("#submit-button");
const playerInputName = document.querySelector("#player-input-name");

submitButton.addEventListener("click", (event) => {
  event.preventDefault();
  localStorage.setItem("player-name", playerInputName.value.toUpperCase());
});

playerInputName.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    submitButton.click();
  }
});

const submitButton = document.querySelector("#submit-button");
const playerInputName = document.querySelector("#player-input-name");
let nameOfPlayer = "";

submitButton.addEventListener("click", (event) => {
  event.preventDefault();
  nameOfPlayer = playerInputName.value.toUpperCase();
  localStorage.setItem("player-name", nameOfPlayer);
});

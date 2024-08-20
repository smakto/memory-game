/// Variables:

let mainGame = document.querySelector(".main-game-board");
let turnCounter = document.querySelector("h5.turn-counter");
let introForm = document.querySelector("form");
let hardDifficulty = document.getElementById("hardDiff");
let medDifficulty = document.getElementById("medDiff");

let symbolDiv;
let iconSymbol;
let results;
let counter = 0;
let clicked = [];
let pairs = [];
let intervalTimer;
let minutes = 0;
let seconds = 0;
let secondsToShow;
let minutesToShow;
const symbols = {
  symbolArrayEasy: ["🌠", "🏹", "🏹", "💌", "🍀", "🌠", "🍀", "💌"],
  symbolArrayMedium: [
    "🌠",
    "🏹",
    "⌛",
    "🏹",
    "💌",
    "❤️️",
    "🍀",
    "🌠",
    "🍀",
    "💌",
    "❤️️",
    "⌛",
  ],
  symbolArrayHard: [
    "🌠",
    "🏠",
    "🏹",
    "⌛",
    "🏹",
    "💌",
    "❤️️",
    "🍀",
    "🧲️",
    "🌠",
    "🍀",
    "💌",
    "❤️️",
    "⌛",
    "🧲️",
    "🏠",
  ],
};

/// Game creation:

function createBase(symbols) {
  const firstFlipCard = document.querySelector(".flip-card");
  const symbolsToRender = Array.from(symbols);

  for (let i = symbolsToRender.length; i > 0; i--) {
    const createIcon = document.createElement("p");
    const randSelector = Math.floor(Math.random() * i);
    createIcon.textContent = symbolsToRender[randSelector];
    symbolsToRender.splice(randSelector, 1);

    const newFlipCard = firstFlipCard.cloneNode(true);
    mainGame.appendChild(newFlipCard);

    newFlipCard.classList.add(`flip-class-${i}`);
    const newFlipCardBack = newFlipCard.querySelector(`.flip-card-back`);
    newFlipCardBack.appendChild(createIcon);
    newFlipCard.style.visibility = "visible";
  }
}

function theGame() {
  symbolDiv = document.querySelectorAll("div.flip-card .flip-card-inner");

  for (let i = 0; i < symbolDiv.length; i++) {
    symbolDiv[i].addEventListener("click", () => {
      if (
        symbolDiv[i].classList.contains("flipped-back") ||
        pairs.includes(symbolDiv[i])
      ) {
        symbolDiv[i].removeEventListener("click", null);
      } else {
        flipCardBack(symbolDiv[i]);
        iconSymbol = symbolDiv[i].querySelector("p");
        counter += 1;
        clicked.push(symbolDiv[i]);
        turnCounter.textContent = "Moves: " + clicked.length;

        for (let j = 1; j < clicked.length; j += 2) {
          let plusJ = j - 1;
          if (
            clicked[j].textContent === clicked[plusJ].textContent &&
            !pairs.includes(clicked[j])
          ) {
            pairs.push(clicked[j]);
            pairs.push(clicked[plusJ]);
            counter = 0;
          }

          pairs.forEach((item) => {
            item.classList.remove("flipped-front");
            item.classList.remove("flipped-back");
            item.removeEventListener("click", null);
          });

          if (counter > 2) {
            let openCards = document.querySelectorAll(".flipped-back");
            openCards.forEach((item) => flipCardFront(item));
            counter = 1;
            flipCardBack(symbolDiv[i]);
          }
        }
        manageTurns();
      }
    });
  }
}

/// Card flip functions:

function flipCardBack(target) {
  target.style.transform = "rotateY(180deg)";
  target.classList.add("flipped-back");

  let targetClasses = Array.from(target.classList);

  if (targetClasses.includes("flipped-front")) {
    target.classList.remove("flipped-front");
  }
}

function flipCardFront(target) {
  target.style.transform = "rotateY(0deg)";
  target.classList.add("flipped-front");

  let targetClasses = Array.from(target.classList);

  if (targetClasses.includes("flipped-back")) {
    target.classList.remove("flipped-back");
  }
}

/// WIN/LOSE message handling:

function showWinMessage() {
  let message = document.createElement("h2");
  let moves = document.createElement("h3");
  let time = document.createElement("h3");
  let checkTime = compareTime();

  if (checkTime) {
    results.bestTime = `${minutesToShow}:${secondsToShow}`;
  }

  message.textContent = "WON!";
  moves.textContent = `Moves: ${clicked.length}`;
  checkTime
    ? (time.textContent = `Time: ${minutesToShow}:${secondsToShow}. NEW BEST!`)
    : (time.textContent = `Time: ${minutesToShow}:${secondsToShow}.`);

  let gameResults = [moves, time, message];
  let endgameScreen = document.querySelector(".game-results-div");

  if (endgameScreen === null) {
    let gameResultsDiv = document.createElement("div");
    gameResultsDiv.setAttribute("class", "game-results-div");
    document.querySelector(".game-finish-message").append(gameResultsDiv);
    gameResults.forEach((item) => {
      gameResultsDiv.append(item);
    });
  } else {
    gameResults.forEach((item) => {
      endgameScreen.append(item);
    });
  }

  turnCounter.style.display = "none";
  results.won += 1;
  localStorage.setItem("personalResults", JSON.stringify(results));
  clearInterval(intervalTimer);
  document.querySelector(".game-finish-container").style.display = "flex";
  renderBestResults();
}

function showLoseMessage() {
  let message = document.createElement("h2");
  let time = document.createElement("h3");
  let moves = document.createElement("h3");

  message.textContent = "LOST!";
  time.textContent = `Time: ${minutesToShow}:${secondsToShow}`;
  moves.textContent = `Moves: ${clicked.length}`;

  let gameResults = [moves, time, message];
  let endgameScreen = document.querySelector(".game-results-div");

  if (endgameScreen === null) {
    let gameResultsDiv = document.createElement("div");
    gameResultsDiv.setAttribute("class", "game-results-div");
    document.querySelector(".game-finish-message").append(gameResultsDiv);
    gameResults.forEach((item) => {
      gameResultsDiv.append(item);
    });
  } else {
    gameResults.forEach((item) => {
      endgameScreen.append(item);
    });
  }

  turnCounter.style.display = "none";
  results.lost += 1;
  localStorage.setItem("personalResults", JSON.stringify(results));
  clearInterval(intervalTimer);
  document.querySelector(".game-finish-container").style.display = "flex";
  renderBestResults();
}

/// Support functions:

function manageTurns() {
  let selectedMoveCount = document.querySelector(`[name="diff"]:checked`).value;

  if (pairs.length === symbolDiv.length - 1) {
    showWinMessage();
  } else if (
    selectedMoveCount !== "unlimited" &&
    selectedMoveCount < clicked.length
  ) {
    showLoseMessage();
  }
}

function countTime() {
  intervalTimer = setInterval(function () {
    seconds += 1;
    if (seconds === 60) {
      seconds = 0;
      minutes += 1;
    }
    secondsToShow = seconds < 10 ? `0${seconds}` : seconds;
    minutesToShow = minutes < 10 ? `0${minutes}` : minutes;

    let selectedTimeLimit = document.querySelector(
      `[name="time"]:checked`
    ).value;

    if (Number(selectedTimeLimit) === seconds) {
      showLoseMessage();
      clearInterval();
    }

    document.querySelector(
      ".timer"
    ).textContent = `Time:  ${minutesToShow}:${secondsToShow}`;
  }, 1000);
}

function softResetGame() {
  clearInterval(intervalTimer);
  let currentResults = document.querySelector(".game-results-div");
  if (currentResults) {
    currentResults.innerHTML = "";
  }

  let selectedBoardSize = document.querySelector(
    `[name="boardSize"]:checked`
  ).value;
  minutes = 0;
  seconds = -1;
  counter = 0;
  clicked = [];
  pairs = [];
  turnCounter.textContent = "Moves: 0";
  countTime();

  symbolDiv.forEach((item) => {
    flipCardFront(item);
  });

  let cardsToReset = document.querySelectorAll(".flip-card");
  cardsToReset = Array.from(cardsToReset).splice(1);

  cardsToReset.forEach((item) => {
    item.remove();
  });

  document.querySelector(".game-finish-container").style.display = "none";
  turnCounter.style.display = "block";

  createBase(
    selectedBoardSize === "smallBoard"
      ? symbols.symbolArrayEasy
      : selectedBoardSize === "medBoard"
      ? symbols.symbolArrayMedium
      : symbols.symbolArrayHard
  );

  theGame();
}

function loadResults() {
  results =
    window.localStorage.length > 0
      ? JSON.parse(localStorage.getItem("personalResults"))
      : { won: 0, lost: 0, bestTime: 0 };
}

function renderBestResults() {
  let resultsDiv = document.querySelector(".best-user-results");
  resultsDiv.innerHTML = "";
  let resultsKeys = Object.keys(results);

  resultsKeys.forEach((key) => {
    let resultLine = document.createElement("h5");
    resultLine.setAttribute("class", `result-${key}`);
    resultsDiv.append(resultLine);
  });

  document.querySelector(".result-won").textContent = `WON: ${results.won}`;
  document.querySelector(".result-lost").textContent = `LOST: ${results.lost}`;
  document.querySelector(
    ".result-bestTime"
  ).textContent = `BEST TIME: ${results.bestTime}`;
}

function compareTime() {
  let currentBestTime = results.bestTime;
  let isTimeBetter = true;
  if (currentBestTime !== 0) {
    const currentBestSplit = currentBestTime.split(":");
    let bestSplitNumber = currentBestSplit.map((item) => (item = Number(item)));

    let bestTimeInSeconds = bestSplitNumber[0] * 60 + bestSplitNumber[1];
    let currentTimeInSeconds = minutes * 60 + seconds;

    bestTimeInSeconds > currentTimeInSeconds
      ? (isTimeBetter = true)
      : (isTimeBetter = false);
  }
  return isTimeBetter;
}

/// Listeners & function call:

introForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let selectedBoardSize = document.querySelector(
    `[name="boardSize"]:checked`
  ).value;

  introForm.style.display = "none";
  mainGame.style.display = "block";
  document.querySelector(".game-result-board").style.display = "flex";

  createBase(
    selectedBoardSize === "smallBoard"
      ? symbols.symbolArrayEasy
      : selectedBoardSize === "medBoard"
      ? symbols.symbolArrayMedium
      : symbols.symbolArrayHard
  );

  theGame();
  countTime();
});

document.querySelector(".soft-reset-button").addEventListener("click", () => {
  softResetGame();
});

document.querySelector(".hard-reset-button").addEventListener("click", () => {
  window.location.reload();
});

document.querySelector(".reset-button").addEventListener("click", () => {
  softResetGame();
});

loadResults();
renderBestResults();
compareTime();

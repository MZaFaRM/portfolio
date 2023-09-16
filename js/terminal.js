function toggleClickEffect() {
  const photo = document.getElementById("clickable-photo");
  photo.classList.toggle("clicked");
}

let board = Array(9).fill(null);
let currentPlayer = "X";
let isGameOver = false;

function makeMove(index) {
  if (board[index] || isGameOver) {
    return;
  }

  board[index] = currentPlayer;
  document.querySelectorAll(".cell")[index].textContent = currentPlayer;

  if (checkWinner()) {
    document.getElementById("message").textContent = currentPlayer + " Wins!";
    isGameOver = true;
    return;
  } else if (board.every((cell) => cell)) {
    document.getElementById("message").textContent = "It's a draw!";
    isGameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function checkWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let pattern of winPatterns) {
    if (
      board[pattern[0]] &&
      board[pattern[0]] === board[pattern[1]] &&
      board[pattern[1]] === board[pattern[2]]
    ) {
      return true;
    }
  }
  return false;
}


window.makeMove = makeMove;
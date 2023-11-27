let games = [];
export let tictactoeGamesCounter = 0;

class Game {
  constructor(cell) {
    this.game = getGame(cell);
    this.id = this.game.id;
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.isGameOver = false;
    this.cells = this.game.querySelectorAll(".cell");
    this.messageBox = this.game.parentNode.querySelector("#message");
  }
}

function getGame(cell) {
  return cell.parentNode.parentNode;
}

function refreshGame(game) {
  game.game = document.getElementById(game.id);
  game.cells = game.game.querySelectorAll(".cell");
  game.messageBox = game.game.parentNode.querySelector("#message");
}

function makeMove(cell, index) {
  for (let game of games) {
    if (game.isGameOver) {
      continue;
    }
    refreshGame(game);
  }

  const newGame = getGame(cell);
  let game = games.find((game) => game.id === newGame.id);

  if (!game) {
    game = new Game(cell);
    games.push(game);
  }

  if (game.board[index] || game.isGameOver) {
    return;
  }

  game.cells[index].textContent = game.currentPlayer;
  game.board[index] = game.currentPlayer;

  if (checkWinner(game.board)) {
    game.messageBox.textContent = game.currentPlayer + " Wins!";
    game.isGameOver = true;
    return;
  } else if (game.board.every((cell) => cell !== null)) {
    game.messageBox.textContent = "It's a draw!";
    game.isGameOver = true;
    return;
  }

  game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
}

function checkWinner(board) {
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
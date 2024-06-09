const EMPTY = null;
const X = "X";
const O = "O";

let currentPlayer = X;
let games = [];

export class Game {
  constructor(gameBoard) {
    this.id = gameBoard.id;
    this.board = Array(9).fill(null);
    this.currentPlayer = currentPlayer;

    // Alternate the current player between X and O
    if (currentPlayer === O) {
      currentPlayer = X;
    } else {
      currentPlayer = O;
    }

    // AI Player is the player that is not the current player
    this.AIPlayer = this.currentPlayer === X ? O : X;

    this.isGameOver = false;

    if (this.AIPlayer === X) {
      this.minimax();
    }

    games.push(this);
  }

  winner(board) {
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
        return board[pattern[0]];
      }
    }
    return null;
  }

  terminal(board) {
    if (!winner(board) && board.flat().some((box) => box === EMPTY)) {
      return false;
    } else {
      return true;
    }
  }

  utility(board) {
    const winPlayer = winner(board);
    if (winPlayer === X) {
      return 1;
    } else if (winPlayer === O) {
      return -1;
    } else {
      return 0;
    }
  }

  player(board) {
    const flatBoard = board.flat();
    const xCount = flatBoard.filter((cell) => cell === X).length;
    const oCount = flatBoard.filter((cell) => cell === O).length;
    return xCount > oCount ? O : X;
  }

  actions(board) {
    const actions = new Set();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === EMPTY) {
          actions.add([i, j]);
        }
      }
    }
    return actions;
  }

  result(board, action) {
    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board
    const currentPlayer = player(newBoard);
    const [x, y] = action;

    if (newBoard[x][y] !== EMPTY) {
      throw new Error("A player has already made this move!");
    } else if (x < 0 || x > 2 || y < 0 || y > 2) {
      throw new Error("Invalid move given");
    } else {
      newBoard[x][y] = currentPlayer;
      return newBoard;
    }
  }

  minimax(board) {
    if (terminal(board)) {
      return null;
    }

    const currentPlayer = player(board);
    if (board.flat().every((box) => box === EMPTY)) {
      return [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    }
    if (currentPlayer === X) {
      return Array.from(actions(board)).reduce(
        (bestAction, action) => {
          const value = minValue(result(board, action));
          return value > bestAction.value ? { action, value } : bestAction;
        },
        { action: null, value: -Infinity }
      ).action;
    } else if (currentPlayer === O) {
      return Array.from(actions(board)).reduce(
        (bestAction, action) => {
          const value = maxValue(result(board, action));
          return value < bestAction.value ? { action, value } : bestAction;
        },
        { action: null, value: Infinity }
      ).action;
    }
  }

  maxValue(board, alpha = -Infinity, beta = Infinity) {
    if (terminal(board)) {
      return utility(board);
    } else {
      let v = -Infinity;
      for (let move of actions(board)) {
        v = Math.max(v, minValue(result(board, move), alpha, beta));
        alpha = Math.max(alpha, v);
        if (beta <= alpha) {
          break;
        }
        if (v === 1) {
          break;
        }
      }
      return v;
    }
  }

  minValue(board, alpha = -Infinity, beta = Infinity) {
    if (terminal(board)) {
      return utility(board);
    } else {
      let v = Infinity;
      for (let move of actions(board)) {
        v = Math.min(v, maxValue(result(board, move), alpha, beta));
        beta = Math.min(beta, v);
        if (beta <= alpha) {
          break;
        }
        if (v === -1) {
          break;
        }
      }
      return v;
    }
  }
}

export class TicTacToeGameCounter {
  static instance = null;

  constructor() {
    if (TicTacToeGameCounter.instance) {
      return TicTacToeGameCounter.instance;
    }
    this.counter = 0;
    TicTacToeGameCounter.instance = this;
  }

  incrementCounter() {
    this.counter += 1;
  }

  getCurrentCount() {
    return this.counter;
  }
}

function getGame(cell) {
  return cell.parentNode.parentNode;
}

export function makeMove(cell, index) {
  const newGame = getGame(cell);
  let game = games.find((game) => game.id === newGame.id);

  if (index !== null) {
    if (game.board[index] || game.isGameOver) {
      return;
    }

    const gameHTML = document.getElementById(game.id);
    gameHTML.querySelectorAll(".cell")[index].textContent = game.currentPlayer;

    game.board[index] = game.currentPlayer;

    if (game.winner(game.board)) {
      gameHTML.parentNode.querySelector("#message").textContent =
        game.currentPlayer + " Wins!";
      game.isGameOver = true;
      return;
    } else if (game.board.every((cell) => cell !== null)) {
      gameHTML.parentNode.querySelector("#message").textContent =
        "It's a draw!";
      game.isGameOver = true;
      return;
    }

    game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
  }
}

window.makeMove = makeMove;

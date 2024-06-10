const EMPTY = null;
const X = "X";
const O = "O";

let currentPlayer = X;
let games = [];

export class Game {
  constructor(gameTemplate) {
    this.gameBoard = gameTemplate.querySelector(".tictactoe-board");
    this.id = this.gameBoard.id;
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
      const move = this.minimax(this.board);
      this.gameBoard.querySelectorAll(".cell")[move].textContent =
        this.AIPlayer;
      this.board[move] = this.AIPlayer;
    }
    console.log(this.gameBoard);
    gameTemplate.querySelector("#ai").innerHTML = this.AIPlayer;
    gameTemplate.querySelector("#player").innerHTML = this.currentPlayer;

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
    if (!this.winner(board) && board.flat().some((cell) => cell == EMPTY)) {
      return false;
    } else {
      return true;
    }
  }

  utility(board) {
    const winPlayer = this.winner(board);
    if (winPlayer === X) {
      return 1;
    } else if (winPlayer === O) {
      return -1;
    } else {
      return 0;
    }
  }

  actions(board) {
    const actions = new Set();
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY) {
        actions.add(i);
      }
    }
    return actions;
  }

  player(board) {
    const xCount = board.flat().filter((cell) => cell === X).length;
    const oCount = board.flat().filter((cell) => cell === O).length;

    if (xCount === oCount) {
      return X;
    } else {
      return O;
    }
  }

  result(board, action) {
    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board
    const currentPlayer = this.player(newBoard);

    if (newBoard[action] !== EMPTY) {
      throw new Error("A player has already made this move!");
    } else if (action < 0 || action > 8) {
      throw new Error("Invalid move given");
    } else {
      newBoard[action] = currentPlayer;
      return newBoard;
    }
  }

  minimax(board) {
    if (this.terminal(board)) {
      return null;
    }

    if (board.flat().every((box) => box === EMPTY)) {
      return Math.floor(Math.random() * 9);
    }
    if (this.AIPlayer === X) {
      // AI will try to maximize the value of the board by selecting
      // the action with the highest value from all the possible actions
      return Array.from(this.actions(board)).reduce(
        (bestAction, action) => {
          const value = this.minValue(this.result(board, action));
          return value > bestAction.value ? { action, value } : bestAction;
        },
        { action: null, value: -Infinity }
      ).action;
    } else if (this.AIPlayer === O) {
      // AI will try to minimize the value of the board by selecting
      // the action with the lowest value from all the possible actions
      return Array.from(this.actions(board)).reduce(
        (bestAction, action) => {
          const value = this.maxValue(this.result(board, action));
          return value < bestAction.value ? { action, value } : bestAction;
        },
        { action: null, value: Infinity }
      ).action;
    }
  }

  maxValue(board, alpha = -Infinity, beta = Infinity) {
    if (this.terminal(board)) {
      return this.utility(board);
    } else {
      let v = -Infinity;
      for (let move of this.actions(board)) {
        v = Math.max(v, this.minValue(this.result(board, move), alpha, beta));
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
    if (this.terminal(board)) {
      return this.utility(board);
    } else {
      let v = Infinity;
      for (let move of this.actions(board)) {
        v = Math.min(v, this.maxValue(this.result(board, move), alpha, beta));
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

function markEndGame(game, gameHTML) {
  // Check if the game is over
  // and display the winner or a draw message
  const winner = game.winner(game.board);
  if (winner) {
    gameHTML.parentNode.querySelector("#message").textContent =
      winner + " Wins!";
    game.isGameOver = true;
    return true;
  } else if (game.board.every((cell) => cell !== null)) {
    gameHTML.parentNode.querySelector("#message").textContent = "It's a draw!";
    game.isGameOver = true;
    return true;
  }
}

export function makeMove(cell, index) {
  const newGame = getGame(cell);
  let game = games.find((game) => game.id === newGame.id);

  if (index !== null) {
    if (game.board[index] || game.isGameOver) {
      return;
    }

    if (game.player(game.board) !== game.currentPlayer) {
      return;
    }

    const gameHTML = document.getElementById(game.id);
    gameHTML.querySelectorAll(".cell")[index].textContent = game.currentPlayer;

    game.board[index] = game.currentPlayer;

    // Check if the game is over
    // else let the AI make a move
    // and check & display if the game is over
    if (markEndGame(game, gameHTML)) {
      return;
    } else {
      const move = game.minimax(game.board);
      // Setting some artificial delay because the AI is too fast
      setTimeout(() => {
        gameHTML.querySelectorAll(".cell")[move].textContent = game.AIPlayer;
        game.board[move] = game.AIPlayer;
        markEndGame(game, gameHTML);
      }, 500);
    }
  }
}

window.makeMove = makeMove;

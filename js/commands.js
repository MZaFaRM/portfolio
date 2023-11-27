import { commands, commandDescription } from "./terminal.js";
import { tictactoeGamesCounter } from "./tictactoe.js";

export class SimpleCommands {
  constructor(outputArea) {
    this.outputArea = outputArea;
  }

  executeCommand(command) {
    if (command === "help") {
      return this.sendHelp();
    } else if (command === "repo") {
      return this.sendRepo();
    } else {
      return false;
    }
  }

  sendHelp(outputArea) {
    this.outputArea.innerHTML += `
                        <br>
                            <span style="color: white">
                                Available commands:
                            </span>
                        <br>
                            --
                        <br>
                            <br>`;
    for (const cmd of commands) {
      this.outputArea.innerHTML += `
                                <span style="color: white">
                                    ${cmd}
                                </span>
                                    : ${commandDescription[cmd]}
                            <br>
                        <br>`;
    }
    return true;
  }
  sendRepo(outputArea) {
    this.outputArea.innerHTML += `
                    --
                        <br>
                            <span style="color: white">
                                <a class="highlight" href="https://github.com/MZaFaRM/Portfolio">
                                    Repository link 🔗
                                </a>
                            </span>
                        <br>
                    --`;
    return true;
  }
}

export function tictactoe(command, outputArea) {
  if (command === "tictactoe") {
    tictactoeGamesCounter += 1;
    const newGame = outputArea.querySelector(".tictactoe-board");
    newGame.setAttribute("id", "tictactoe-" + tictactoeGamesCounter);
  }
  return true;
}

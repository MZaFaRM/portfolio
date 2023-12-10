import { commandDescription } from "./terminal.js";
import { TicTacToeGameCounter } from "./tictactoe.js";
import { Projects } from "./projects.js";

export class SimpleCommands {
  constructor() {
    this.outputArea = "";
  }

  async executeCommand(command) {
    if (/^help/.test(command)) {
      this.outputArea += `
      <br>
          <span style="color: white">
              Available commands:
          </span>
      <br>
          --
      <br>
          <br>`;
      return this.listStuff(commandDescription);
    } else if (/^repo/.test(command)) {
      return this.outputArea + this.sendRepo();
    } else {
      return false;
    }
  }

  listStuff(map) {
    let keys = Object.keys(map);
    for (let key of keys) {
      this.outputArea += `
                                <span style="color: white">
                                    ${key}
                                </span>
                                    : ${map[key]}
                            <br>
                        <br>`;
    }
    return this.outputArea;
  }
  sendRepo(outputArea) {
    return `
            --
                <br>
                    <span style="color: white">
                        <a class="highlight" href="https://github.com/MZaFaRM/Portfolio" target="_blank">
                            Repository link 🔗
                        </a>
                    </span>
                <br>
            --`;
  }
}

export class FileCommands extends SimpleCommands {
  constructor(content) {
    super();

    const parser = new DOMParser();
    this.contentPointer = parser.parseFromString(content, "text/html");
    this.content = content;
  }

  async executeCommand(command) {
    if (/^tictactoe/.test(command)) {
      return this.handleTicTacToe();
    } else if (/^projects/.test(command)) {
      return await this.handleProjects(command);
    } else if (/^banner/.test(command)) {
      return this.outputArea + this.content;
    } else if (/^whoami/.test(command)) {
      return this.outputArea + this.content;
    } else {
      return false;
    }
  }

  async handleProjects(command) {
    let projectListing = new Projects(this.contentPointer);
    let projectSpecification = command.match(/^projects (\w+)/);
    if (projectSpecification) {
      this.outputArea = await projectListing.getProject(
        projectSpecification[1]
      );
      return this.outputArea;
    } else {
      let projectList = await projectListing.listProjects();
      this.outputArea +=
        projectListing.outputArea + this.listStuff(projectList);
      return this.outputArea;
    }
  }

  handleTicTacToe() {
    const gameCounter = new TicTacToeGameCounter();
    gameCounter.incrementCounter();
    const newGame = this.contentPointer.querySelector(".tictactoe-board");
    newGame.setAttribute("id", "tictactoe-" + gameCounter.getCurrentCount());
    this.outputArea += this.contentPointer.documentElement.innerHTML;
    return this.outputArea;
  }
}

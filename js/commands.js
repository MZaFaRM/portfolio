import { commandDescription } from "./terminal.js";
import { TicTacToeGameCounter, Game } from "./tictactoe.js";
import { Projects } from "./projects.js";
import { generatePlaceholder } from "./scripts.js";

export class SimpleCommands {
  // SimpleCommands class is used to handle commands that do not require additional content
  // Examples include 'help', 'repo', 'resume', etc.
  constructor() {
    this.outputArea = "";
  }

  async executeCommand(command) {
    if (/^help/.test(command)) {
      // Called to break the constant "Try "help" message once help is used
      generatePlaceholder(true);
      this.outputArea += `
      <br>
          <span style="color: white">
              <span class="sub-heading fancy-3d">
                  Commands
              </span>
              <br>
              
                  <br>
                      Type a command and press enter.  
                  <br>
              <br>
          </span>`;
      return this.listStuff(commandDescription);
    } else if (/^repo/.test(command)) {
      return this.outputArea + this.sendRepo();
    } else if (/^resume/.test(command)) {
      this.outputArea += `
                          <br>
                              <span style="color: white" class="sub-heading fancy-3d">
                                  Resume
                              </span>
                          <br>
                          <br>
                            <a 
                              href="https://docs.google.com/document/d/1RGvgfufNKBGRyRrKwfn89TncH84hvWEhF_tjKZbYNxU/edit?usp=drivesdk"
                              download style="color: white" 
                              class="highlight">
                              Click here to download!
                            </a>
                          <br>
                          <br>`;
      return this.outputArea;
    } else {
      return false;
    }
  }

  listStuff(map) {
    let keys = Object.keys(map);
    let tableHtml = `<table style="color: white;">`;

    for (let key of keys) {
      tableHtml += `
            <tr>
                <td><code class="glow">${key}</code>&nbsp;</td>
                <td>${map[key]}</td>
            </tr>`;
    }

    tableHtml += `</table><br>`;

    this.outputArea += tableHtml;
    return this.outputArea;
  }

  sendRepo(outputArea) {
    return `
              <br>
                  <span style="color: white" class="sub-heading fancy-3d">
                      Repository
                  </span>
              <br>
              <br>
                <a 
                  href="https://github.com/MZaFaRM/Portfolio"
                  target="_blank"
                  style="color: white" 
                  class="highlight">
                  Click here to redirect!
                </a>
              <br>
              <br>`;
  }
}

export class FileCommands extends SimpleCommands {
  // FileCommands class extends SimpleCommands class
  // It is used to handle commands that require additional content
  // Examples include 'tictactoe', 'projects', 'whoami', etc.

  // Static variable to store intervalIds to clear them later
  static intervalIds = [];
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
      return await this.handleWHoAmI();
    } else {
      return false;
    }
  }

  async handleProjects(command) {
    let projectListing = new Projects(this.contentPointer);
    let projectSpecification = command.match(/^projects (.+)/);
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
    // Function call and other initializations are done by the html's boxes
    // which fetches the game and plays on it
    // This function is just to create a new game, it doesn't initialize the game
    // But only sets up the game board
    const gameCounter = new TicTacToeGameCounter();
    gameCounter.incrementCounter();
    const newGameBoard = this.contentPointer.querySelector(".tictactoe-board");
    newGameBoard.setAttribute(
      "id",
      "tictactoe-" + gameCounter.getCurrentCount()
    );
    const newGameData = new Game(this.contentPointer);

    this.outputArea += this.contentPointer.documentElement.innerHTML;

    return this.outputArea;
  }

  static clearIntervals(signatures) {
    for (let i = 0; i < signatures.length; i++) {
      if (signatures[i].innerText === "Muhammed Zafar MM") {
        clearInterval(FileCommands.intervalIds[i]);
      }
    }
  }

  handleWHoAmI() {
    const intervalId = setInterval(() => {
      const data = "Muhammed Zafar MM";
      const signatures = document.querySelectorAll(".signature");
      FileCommands.clearIntervals(signatures);

      signatures.forEach((signature) => {
        if (signature.innerText.length < data.length) {
          let letterIndex = signature.innerText.length;

          while (data[letterIndex] === " ") {
            letterIndex++;
          }
          signature.innerText += data.slice(
            signature.innerText.length,
            letterIndex + 1
          );
        }
      });
    }, 250);
    FileCommands.intervalIds.push(intervalId);
    return this.outputArea + this.content;
  }
}

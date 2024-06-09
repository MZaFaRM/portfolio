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
                              href="other/Muhammed Zafar Resume.pdf"
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
    // Function call and other initializations are done by the html's boxes
    // which fetches the game and plays on it
    // This function is just to create a new game, it doesn't initialize the game
    // But only sets up the game board
    const gameCounter = new TicTacToeGameCounter();
    gameCounter.incrementCounter();
    const newGameBoard = this.contentPointer.querySelector(".tictactoe-board");
    newGameBoard.setAttribute("id", "tictactoe-" + gameCounter.getCurrentCount());
    const newGameData = new Game(newGameBoard);

    this.outputArea += this.contentPointer.documentElement.innerHTML;

    return this.outputArea;
  }
}

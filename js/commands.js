import { commandDescription } from "./terminal.js";
import { TicTacToeGameCounter, Game } from "./tictactoe.js";
import { Projects, Experience } from "./listCommands.js";
import { generatePlaceholder } from "./scripts.js";

export class SimpleCommands {
	// SimpleCommands class is used to handle commands that do not require additional content
	// Examples include 'help', 'repo', etc.
	constructor() {
		this.outputArea = "";
	}

	async executeCommand(command) {
		if (/^help/i.test(command)) {
			// Called to break the constant "Try "help" message once help is used
			generatePlaceholder(true);
			this.outputArea += `
          <div>
              <p class="sub-heading fancy-3d flicker">
								commands_
              </p>
              <p>
								Type a command and press enter.  
              </p>
          </div>`;
			return this.listStuff(commandDescription);
		} else if (/^repo/i.test(command)) {
			return this.outputArea + this.sendRepo();
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
                <td><span class="clickable">${key}</span>&nbsp;</td>
                <td>${map[key]}</td>
            </tr>`;
		}

		tableHtml += `</table><br>`;

		this.outputArea += tableHtml;
		return this.outputArea;
	}

	sendRepo(outputArea) {
		return `
                  <span class="sub-heading fancy-3d glitch">
                      repository_
                  </span>
              <br>
              <br>
                <a 
                  href="https://github.com/MZaFaRM/Portfolio"
                  target="_blank"
                  
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
		if (/^tictactoe/i.test(command)) {
			return this.handleTicTacToe();
		} else if (/^projects/i.test(command)) {
			return await this.handleProjects(command);
		} else if (/^banner/i.test(command)) {
			return this.outputArea + this.content;
		} else if (/^whoami/i.test(command)) {
			return await this.handleWHoAmI();
		} else if (/^experience/i.test(command)) {
			return await this.handleExperience(command);
		} else {
			throw new Error("Command not found");
		}
	}

	async handleProjects(command) {
		let projectListing = new Projects(this.contentPointer);
		let projectSpecification = command.match(/^projects (.+)/);
		if (projectSpecification) {
			this.outputArea = await projectListing.getItem(
				projectSpecification[1],
			);
			return this.outputArea;
		} else {
			let projectList = await projectListing.listItems();
			this.outputArea += projectListing.outputArea + projectList;
			return this.outputArea;
		}
	}

	async handleExperience(command) {
		let experienceListing = new Experience(this.contentPointer);
		let experienceSpecification = command.match(/^experience (.+)/);
		if (experienceSpecification) {
			this.outputArea = await experienceListing.getItem(
				experienceSpecification[1],
			);
			return this.outputArea;
		} else {
			let experienceList = await experienceListing.listItems();
			this.outputArea += experienceListing.outputArea + experienceList;
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
		const newGameBoard =
			this.contentPointer.querySelector(".tictactoe-board");
		newGameBoard.setAttribute(
			"id",
			"tictactoe-" + gameCounter.getCurrentCount(),
		);
		const newGameData = new Game(this.contentPointer);

		this.outputArea += this.contentPointer.documentElement.innerHTML;

		return this.outputArea;
	}

	static clearIntervals(signatures) {
		for (let i = 0; i < signatures.length; i++) {
			if (signatures[i].innerText === "مُحَمَّد ظَفَر مُبَارَك مَنزِل") {
				clearInterval(FileCommands.intervalIds[i]);
			}
		}
	}

	handleWHoAmI() {
		const intervalId = setInterval(() => {
			const data = "مُحَمَّد ظَفَر مُبَارَك مَنزِل";
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
						letterIndex + 1,
					);
				}
			});
		}, 250);
		FileCommands.intervalIds.push(intervalId);
		return this.outputArea + this.content;
	}
}

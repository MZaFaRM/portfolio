import { TicTacToeGameCounter, Game } from "./tictactoe.js";
import { Projects, Experience } from "./listCommands.js";
import { generatePlaceholder } from "./scripts.js";

class TerminalConfig {
	#baseCommands = [
		"help",
		"repo",
		"banner",
		"resume",
		"projects",
		"experience",
		"tictactoe",
		"whoami",
	];

	#loaders = {
		projects: "../pages/projects.html",
		experience: "../pages/experience.html",
	};

	#cache = {};
	ready = null;

	constructor() {
		this.ready = Promise.all(
			Object.entries(this.#loaders).map(([key, url]) =>
				this.#load(key, url),
			),
		);
	}

	async #load(key, url) {
		const text = await fetch(url).then((r) => r.text());
		const parser = new DOMParser();
		const content = parser.parseFromString(text, "text/html");
		this.#cache[key] = content;
		content.querySelectorAll(`[id]`).forEach((el) => {
			this.#baseCommands.push(`${key} ${el.id}`);
		});
		return content;
	}

	get baseCommands() {
		return this.#baseCommands;
	}

	suggest(prefix) {
		return this.#baseCommands.find((cmd) => cmd.startsWith(prefix)) ?? null;
	}

	async get(key) {
		await this.ready;
		return this.#cache[key] ?? null;
	}
}

export const terminalConfig = new TerminalConfig();

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
			return this.outputArea + this.sendHelp();
		} else if (/^repo/i.test(command)) {
			return this.outputArea + this.sendRepo();
		} else if (/^resume/i.test(command)) {
			return this.outputArea + this.sendResume();
		} else {
			return false;
		}
	}

	sendHelp() {
		const map = {
			help: "list all commands",
			repo: "get repository link",
			banner: "display the project banner",
			resume: "download user resume",
			projects: "list all projects",
			experience: "list all experiences",
			tictactoe: "play a game of tictactoe",
			whoami: "display user information",
			clear: "clear the terminal",
		};

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

		return tableHtml;
	}

	sendRepo() {
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

	sendResume() {
		return `
                  <span class="sub-heading fancy-3d glitch">
                      resume_
                  </span>
              <br>
              <br>
                <a 
                  href="https://docs.google.com/document/d/1RGvgfufNKBGRyRrKwfn89TncH84hvWEhF_tjKZbYNxU/export?format=pdf"
                  target="_blank"
                  class="highlight">
                  Click here to download!
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

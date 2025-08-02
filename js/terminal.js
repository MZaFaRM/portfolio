import { SimpleCommands, FileCommands } from "./commands.js";
import { generatePlaceholder, suggestCommand } from "./scripts.js";

export const commandDescription = {
	help: "get all commands",
	repo: "get project repo link",
	banner: "show the project banner",
	resume: "download my resume",
	projects: "get all of my projects",
	tictactoe: "play a game of tictactoe",
	whoami: "get the aboutme page",
	clear: "clean the terminal",
};

export const commands = Object.keys(commandDescription);

function smoothFocus(inputElement) {
	// Get the bounding rectangle of the inputElement
	const elementRect = inputElement.getBoundingClientRect();
	const absoluteElementTop = elementRect.top + window.scrollY;
	const middle = absoluteElementTop - window.innerHeight / 2;

	// Smoothly scroll to the inputElement
	window.scrollTo({
		top: middle,
		behavior: "smooth",
	});

	document.addEventListener("keypress", (event) => {
		if (
			event.key.match(/^[a-zA-Z]$/) &&
			!(inputElement === document.activeElement)
		) {
			inputElement.focus();
		}
	});
}

// Function to remove the ID attributes from the CLI and its output area.
// This is done to ensure we can add a new CLI input without conflicting IDs.
function releaseCli() {
	const outputArea = document.getElementById("cli-output");
	const commandInput = document.getElementById("cli");
	const cliInput = document.getElementById("cli-text");

	// Only remove the 'id' attribute if the element exists.
	if (cliInput) {
		cliInput.removeAttribute("id");
	}
	if (commandInput) {
		commandInput.removeAttribute("id");
	}
	if (outputArea) {
		outputArea.removeAttribute("id");
	}
}

// Function to set up the CLI input interface on the page.
export async function setBoard() {
	try {
		// Fetch the main container where we will add the CLI content.
		let mainBody = document.querySelector("main");

		// fetch the CLI window.
		let cli = "pages/cli-window.html";

		// Fetch the CLI window content.
		const response = await fetch(cli);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const content = await response.text();

		// Append the fetched CLI content to the main container.
		mainBody.innerHTML += content;

		// Add event listener to the CLI input to handle user input.
		const commandInput = document.getElementById("cli");
		smoothFocus(commandInput);
		const promptSuggest = document.getElementById("prompt-suggest");

		commandInput.addEventListener("input", (event) => {
			if (commandInput.value === "") {
				promptSuggest.innerText = "";
				return;
			} else {
				for (const command of commands) {
					if (command.startsWith(commandInput.value.toLowerCase())) {
						promptSuggest.innerHTML = `<span style="color: transparent" id="user-text">${commandInput.value.trim()}</span>${command.slice(
							commandInput.value.length
						)}`; // Show the suggested command after the commandInput.value
						return;
					}
				}
				promptSuggest.innerText = "";
			}
		});

		commandInput.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				const command = commandInput.value;
				if (command) {
					executeCommand(command); // Execute the command when the Enter key is pressed.
				}
			} else if (event.key === "Tab") {
				event.preventDefault();
				if (promptSuggest.innerText) {
					commandInput.value = promptSuggest.innerText;
					promptSuggest.innerText = "";
				}
			}
		});

		commandInput.addEventListener("click", (event) => {
			if (promptSuggest.innerText) {
				commandInput.value = promptSuggest.innerText;
				promptSuggest.innerText = "";
				executeCommand(commandInput.value);
			}
		});

		document.getElementById("cli").placeholder = generatePlaceholder();
	} catch (error) {
		// Log errors for debugging purposes.
		console.error("Error:", error);
	}
}

// Helper function to determine the file name based on the given command.
function determineFileName(command) {
	// Match the first word, even if it starts with quotes
	let formattedCommand = command.match(/^\S+/);

	// Check if the command is not found or not in the list of commands
	if (!formattedCommand || !commands.includes(formattedCommand[0])) {
		// Handle null formattedCommand
		let commandName = formattedCommand
			? formattedCommand[0]
			: "Unknown Command";
		let error = `${commandName}: command not found`;

		// Only suggest a command if formattedCommand is not null
		if (formattedCommand) {
			const suggestion = suggestCommand(formattedCommand[0], commands);
			if (suggestion) {
				error += `; did you mean: <code class="glow">${suggestion}</code>?`;
			}
		}

		throw new Error(error);
	}

	return `pages/${formattedCommand[0]}.html`;
}

async function postExecutionCleanup() {
	releaseCli();
	await setBoard();
}

function cleanUserCommand(command) {
	// Replace special characters with their escaped counterparts
	const cleanedCommand = command
		.replace(/[\\"']/g, "\\$&")
		.replace(/[\r\n]+/g, " ")
		.replace(/[%<>]/g, "");

	// Trim leading and trailing whitespace
	return cleanedCommand.trim();
}

// Function to handle command execution.
// It fetches the corresponding content based on the command and displays it.
export async function executeCommand(command) {
	let outputArea = document.getElementById("cli-output");
	let cliInput = document.getElementById("cli-text");

	let formattedCommand = cleanUserCommand(command);

	if (cliInput) {
		cliInput.innerHTML = saveUserInput(formattedCommand);
	}
	formattedCommand = formattedCommand.trim();
	let commandHandler = new SimpleCommands();

	try {
		// Commands are of two types - simple commands and file commands.
		// Simple commands are handled by the SimpleCommands class.
		//        - Simple commands are commands that do not require any additional content.
		//        - Examples include 'help', 'repo', 'banner', etc.
		//        - Simple commands are defined in the commandDescription object.
		// File commands are handled by the FileCommands class.
		//        - File commands are commands that require additional content.
		//        - Examples include 'tictactoe', 'projects', 'whoami', etc.
		//        - The content for file commands is stored in the pages directory.
		//        - File commands are defined in the determineFileName function.
		let isSimpleCommand = await commandHandler.executeCommand(
			formattedCommand
		);
		if (isSimpleCommand) {
			outputArea.innerHTML += isSimpleCommand;
			await postExecutionCleanup();
			return;
		} else if (formattedCommand === "clear") {
			outputArea = document.querySelector("main");
			outputArea.innerHTML = "";
			await setBoard();
			return;
		}
		const fileName = determineFileName(formattedCommand);
		let response = await fetch(fileName);
		let content = await response.text();

		const fileCommandHandler = new FileCommands(content);
		outputArea.innerHTML += await fileCommandHandler.executeCommand(
			formattedCommand
		);
		await postExecutionCleanup();
	} catch (error) {
		await handleError(error, outputArea);
	}
}

function saveUserInput(command) {
	return `
    <div class="prompt-text">
      <span style="color: #15ff00">MZaFaRM</span>@<span style="color: #ffff06">home</span>$ ~ ${command}
    </div>`;
}
async function handleError(error, outputArea) {
	outputArea.innerHTML += "<br>mzafarm: " + error.message + "<br><br>";
	await postExecutionCleanup();
}

async function initBoard() {
	await setBoard();
	await executeCommand("banner");

	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has("commands")) {
		const commands = urlParams.get("commands").split(",");
		for (const command of commands) {
			await executeCommand(command.trim());
		}
	}
}

// Initialize the board by setting up the first CLI input.
initBoard();

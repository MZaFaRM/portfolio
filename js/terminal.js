import { SimpleCommands, FileCommands } from "./commands.js";

export const commandDescription = {
  help: "List all commands",
  repo: "Get project repo link",
  banner: "Show the project banner page",
  resume: "Download my resume",
  projects: "List of my projects",
  tictactoe: "Play a game of tictactoe",
  whoami: "About me page",
  clear: "To clean the terminal",
};

export const commands = Object.keys(commandDescription);

function focusWithoutScrolling(inputElement) {
  // Store the current position values.
  const prevPosition = inputElement.style.position;
  const prevTop = inputElement.style.top;

  // Temporarily fix the position.
  inputElement.style.position = "fixed";
  inputElement.style.top = "0px";

  // Focus the element.
  inputElement.focus();

  // Restore the previous position values.
  inputElement.style.position = prevPosition;
  inputElement.style.top = prevTop;
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
    focusWithoutScrolling(commandInput);

    commandInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const command = commandInput.value;
        executeCommand(command); // Execute the command when the Enter key is pressed.
      }
    });
  } catch (error) {
    // Log errors for debugging purposes.
    console.error("Error:", error);
  }
}

// Helper function to determine the file name based on the given command.
function determineFileName(command) {
  let formattedCommand = command.match(/^\w+/)[0]
  if (!commands.includes(formattedCommand)) {
    throw new Error(`${formattedCommand}: command not found`);
  }
  // return `https://mzafarm.github.io/Portfolio/pages/${command}.html`;
  return `pages/${formattedCommand}.html`;
}

function postExecutionCleanup() {
  releaseCli();
  setBoard();
}

// Function to handle command execution.
// It fetches the corresponding content based on the command and displays it.
async function executeCommand(command) {
  let outputArea = document.getElementById("cli-output");
  let cliInput = document.getElementById("cli-text");

  if (cliInput) {
    cliInput.innerHTML = saveUserInput(command);
  }
  let formattedCommand = command.toLowerCase().trim();
  let commandHandler = new SimpleCommands();

  try {
    let isSimpleCommand = await commandHandler.executeCommand(formattedCommand)
    if (isSimpleCommand) {
      outputArea.innerHTML += isSimpleCommand;
      postExecutionCleanup();
      return;
    } else if (formattedCommand === "clear") {
      outputArea = document.querySelector("main");
      outputArea.innerHTML = "";
      setBoard();
      return;
    }
    const fileName = determineFileName(formattedCommand);
    let response = await fetch(fileName);
    let content = await response.text();

    const fileCommandHandler = new FileCommands(content);
    outputArea.innerHTML += await fileCommandHandler.executeCommand(formattedCommand);
    postExecutionCleanup();
  } 
  catch (error) {
    handleError(error, outputArea);
  }
}

function saveUserInput(command) {
  return `
    <div class="prompt-text">
      <span style="color: #15ff00">MZaFaRM</span>@<span style="color: #ffff06">home</span>$ ~ ${command}
    </div>`;
}
function handleError(error, outputArea) {
  outputArea.innerHTML += "<br>mzafarm: " + error.message + "<br><br>";
  postExecutionCleanup();
}

function initBoard() {
  setBoard().then(() => {
    executeCommand("banner");
  });
}
// Initialize the board by setting up the first CLI input.
initBoard();

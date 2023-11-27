let counter = 0;

const commands = ["banner", "projects", "tictactoe", "whoami", "help", "repo", "clear"];

const commandDescription = {
  help: "List all commands",
  repo: "Get project repo link",
  banner: "Show the project banner page",
  projects: "List of my projects",
  tictactoe: "Play a game of tictactoe",
  whoami: "About me page",
  clear: "To clean the terminal",
};

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
async function setBoard() {
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
  if (!commands.includes(command)) {
    throw new Error(`${command}: command not found`);
  }
  // return `https://mzafarm.github.io/Portfolio/pages/${command}.html`;
  return `pages/${command}.html`;
}

// Function to handle command execution.
// It fetches the corresponding content based on the command and displays it.
function executeCommand(command) {
  let outputArea = document.getElementById("cli-output");
  let cliInput = document.getElementById("cli-text");

  if (cliInput) {
    cliInput.innerHTML = saveUserInput(command);
  }

  function handleError(error) {
    outputArea.innerHTML += "<br>mzafarm: " + error.message + "<br><br>";
    postExecutionCleanup();
  }

  function postExecutionCleanup() {
    releaseCli();
    setBoard();
  }

  try {
    if (command === "clear") {
      clearScreen();
      return;
    } else if (command === "help") {
      outputArea.innerHTML += `<br><span style="color: white">Available commands:</span><br>--<br><br>`;
      for (const cmd of commands) {
        outputArea.innerHTML += `<span style="color: white">${cmd}</span>: ${commandDescription[cmd]}<br>`;
      }
      outputArea.innerHTML += `<br>`;
      postExecutionCleanup();
      return;
    } else if (command === "repo") {
      outputArea.innerHTML += `--<br><span style="color: white"><a class="highlight" href="https://github.com/MZaFaRM/Portfolio">Repository link 🔗</a></span><br>--<br>`;
      postExecutionCleanup();
      return;
    }

    const fileName = determineFileName(command);
    fetch(fileName)
      .then((response) => response.text())
      .then((content) => {
        outputArea.innerHTML += content;
        if (command === "tictactoe") {
          counter += 1;
          const newGame = outputArea.querySelector(".tictactoe-board");
          newGame.setAttribute("id", "tictactoe-" + counter);
        }
        postExecutionCleanup();
      })
      .catch(handleError);
  } catch (error) {
    handleError(error);
  }

  function saveUserInput(command) {
    return `<div class="prompt-text"><span style="color: #15ff00">MZaFaRM</span>@<span style="color: #ffff06">home</span>$ ~ ${command}</div>`;
  }
}

function clearScreen() {
  const outputArea = document.querySelector("main");
  outputArea.innerHTML = "";
  setBoard();
  return;
}

function initBoard() {
  setBoard().then(() => {
    executeCommand("projects");
  });
}
// Initialize the board by setting up the first CLI input.
initBoard();

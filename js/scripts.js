import { commands } from "./terminal.js";

document.addEventListener("DOMContentLoaded", function () {
  const photo = document.getElementById("clickable-photo");

  if (photo) {
    photo.addEventListener("click", toggleClickEffect);
  }
});

function toggleClickEffect() {
  const photo = document.getElementById("clickable-photo");
  photo.classList.toggle("clicked");
}

// Function to calculate the Levenshtein Distance
function levenshteinDistance(a, b) {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          )
        ); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
}

// Function to find the closest match
export function suggestCommand(input, validCommands) {
  let closestMatch = null;
  let lowestDistance = Infinity;
  const MinimumEdits = 3;

  validCommands.forEach((command) => {
    const distance = levenshteinDistance(input, command);
    if (distance < MinimumEdits && distance < lowestDistance) {
      lowestDistance = distance;
      closestMatch = command;
    }
  });

  return closestMatch;
}

// Flag to control the display of the 'help' placeholder
let showHelpPlaceholder = true;
// Variable to remember the last suggested command
let lastCommand = null;

/**
 * Generates a placeholder text for the input field.
 * 
 * @param {boolean} shouldReset - If true, stops showing the 'help' placeholder 
 *                                and starts showing random command suggestions.
 * @returns {string} The placeholder text.
 */
export function generatePlaceholder(shouldReset = false) {
  // If shouldReset is true, change the flag to stop showing the 'help' placeholder
  if (shouldReset) {
    showHelpPlaceholder = false;
  }

  // If the flag is true, return the 'help' placeholder
  if (showHelpPlaceholder) {
    return `Try "help"...`;
  } else {
    // If the flag is false, return a placeholder with a random command
    let key = lastCommand;
    // Loop until a different command than the last one is found
    while (key === lastCommand) {
      let randomIndex = Math.floor(Math.random() * commands.length);
      key = commands[randomIndex];
    }
    // Update lastCommand for next time
    lastCommand = key;
    return `Try "${key}"...`;
  }
}




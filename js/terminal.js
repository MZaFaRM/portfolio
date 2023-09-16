document.getElementById("main-banner");

document.addEventListener("DOMContentLoaded", function () {
    const promptInput = document.getElementById("promptInput");
    const elementToMakeVisible = document.querySelector("main-banner"); // Replace with the actual element you want to show

    promptInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const inputValue = promptInput.value.trim().toLowerCase(); // Convert input to lowercase for case-insensitivity

        if (inputValue === "banner") {
          // Check if the input matches "banner"
          elementToMakeVisible.style.display = "block"; // Change "block" to the appropriate display style
        } else {
          elementToMakeVisible.style.display = "none"; // Hide the element for other inputs
        }

        // Clear the input field
        promptInput.value = "";
      }
    });
  });
import { titleCard, mainText, titleCardSmall } from "./terminal-output.js";

const PromptDefault =
  convertHexToSpan("[#d79921]clickery") +
  "@" +
  convertHexToSpan("[#98971a]clickery-webpage") +
  "$ ~ ";

const commandList = ["banner", "getting-started"];

function convertHexToSpan(text, classes = "") {
  const regex = /\[#([\dA-Fa-f]{6})\]/g; // regex to match color codes
  if (!classes) {
  return text.replace(regex, '<span style="color: #$1">') + "</span>";
  }
  return text.replace(regex, '<span style="color: #$1" class="'+ classes + '">') + "</span>";
}

class PromptConnector {
  constructor() {
    this.promptIndex = 0;
    this.promptContainer = document.createElement("div");
    this.promptContainer.classList.add("prompt-container");
    var main = document.querySelector("main");
    main.appendChild(this.promptContainer);
    this.createPrompt();
  }

  createPrompt() {
    const promptWrapper = document.createElement("div");
    promptWrapper.classList.add("prompt-wrapper");
    const promptText = document.createElement("div");
    promptText.classList.add("prompt-text");
    promptText.innerHTML = PromptDefault;
    const promptTaker = document.createElement("div");
    promptTaker.classList.add("prompt-taker");
    const promptInput = document.createElement("input");
    promptInput.type = "text";
    promptInput.classList.add("prompt-input");
    promptInput.addEventListener("keydown", this.handleKeyDown.bind(this));
    const promptOutput = document.createElement("p");
    promptOutput.classList.add("prompt-output");

    promptTaker.appendChild(promptText);
    promptTaker.appendChild(promptInput);

    promptWrapper.appendChild(promptTaker);
    promptWrapper.appendChild(promptOutput);

    this.promptContainer.appendChild(promptWrapper);
    promptInput.focus();
    this.currentPromptOutput = promptOutput;
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      const promptInput = event.target;
      if (commandList.includes(promptInput.value)) {
        if (promptInput.value === "banner") {
          let banner = "";
          var screenWidth = window.innerWidth;
          if (screenWidth > 420) {
          for (let i = 0; i < titleCard.length; i++) {
            banner += convertHexToSpan("[#ebdbb2]" + titleCard[i], "title-card-large") + "<br>";
          }
        }
        else {
          for (let i = 0; i < titleCardSmall.length; i++) {
            banner += convertHexToSpan("[#ebdbb2]" + titleCardSmall[i], "title-card-small") + "<br>";
          }
        }
          for (let i = 0; i < mainText.length; i++) {
            banner +=
            convertHexToSpan("[#ebdbb2]" + mainText[i]) + "<br>";
          }
          this.currentPromptOutput.innerHTML += banner;
        } else if (promptInput.value === "getting-started") {
          for (let i = 0; i < titleCard.length; i++) {
            this.currentPromptOutput.innerHTML +=
              convertHexToSpan("[#ebdbb2]" + titleCard[i]) + "<br>";
          }
        }
      } else {
        this.currentPromptOutput.innerHTML =
          convertHexToSpan("[#ebdbb2]clickery") +
          ": " +
          promptInput.value +
          convertHexToSpan("[#E86A33] command not found");
      }
      promptInput.disabled = true;
      this.createPrompt();
    }
  }
}

const promptConnector = new PromptConnector();

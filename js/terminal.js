
import {
    titleCard,
    mainText,
    gettingStarted
} from "./terminal-output.js";

const PromptDefault =

    convertHexToSpan("[#d79921]clickery") +

    "@" +

    convertHexToSpan("[#98971a]clickery-webpage") +

    "$ ~ ";

const commandList = ["banner", "start", "help", "clear"];

function convertHexToSpan(text, classes = "") {

    const regex = /\[#([\dA-Fa-f]{6})\]/g; // regex to match color codes

    if (!classes) {

        return text.replace(regex, '<span style="color: #$1">') + "</span>";

    }

    return (

        text.replace(regex, '<span style="color: #$1" class="' + classes + '">') +

        "</span>"

    );

}

class PromptConnector {

    constructor() {

        this.promptIndex = 0;

        this.promptContainer = document.createElement("div");

        this.promptContainer.classList.add("prompt-container");

        var main = document.querySelector("main");

        main.appendChild(this.promptContainer);

        this.createPrompt();

        this.showTitleCard();

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

        this.promptInput = promptInput;

        this.currentPromptOutput = promptOutput;

    }

    showTitleCard() {

        let banner = "";

        this.promptInput.value = "banner";

        for (let i = 0; i < titleCard.length; i++) {

            banner +=

                convertHexToSpan("[#ebdbb2]" + titleCard[i], "fancy-3d") + "<br>";

        }

        for (let i = 0; i < mainText.length; i++) {

            banner += convertHexToSpan("[#ebdbb2]" + mainText[i]) + "<br>";

        }

        this.currentPromptOutput.innerHTML += banner;

        if (this.promptIndex == 0) {

            this.promptIndex++;

            this.promptInput.disabled = true;

            this.createPrompt();

        }

    }

    handleKeyDown(event) {

        if (event.keyCode === 13) {

            event.preventDefault();

            const promptInput = event.target;

            let promptText = promptInput.value.toLowerCase().trim();

            if (commandList.includes(promptText)) {

                if (promptText === "banner") {

                    this.showTitleCard();

                } else if (promptText === "start") {

                    let HTMLOutput = "";

                    for (let i = 0; i < gettingStarted.length; i++) {

                        HTMLOutput += convertHexToSpan(gettingStarted[i]) + "<br>";

                    }

                    this.currentPromptOutput.innerHTML += HTMLOutput;

                } else if (promptText === "help") {

                    let HTMLOutput = "";

                    for (let i = 0; i < commandList.length; i++) {

                        HTMLOutput += convertHexToSpan("\t" + commandList[i]) + "<br><br>";

                    }

                    this.currentPromptOutput.innerHTML += HTMLOutput;

                } else if (promptText === "clear") {

                    var main = document.querySelector("main");

                    main.innerHTML = "";

                    this.promptIndex = -1;

                    this.promptContainer = document.createElement("div");

                    this.promptContainer.classList.add("prompt-container");

                    main.appendChild(this.promptContainer);

                    this.createPrompt();

                    return 1;

                }

            } else if (promptText.length == 0) {} else {

                this.currentPromptOutput.innerHTML =

                    convertHexToSpan("[#ebdbb2]clickery") +

                    ": " +

                    promptInput.value +

                    convertHexToSpan("[#E86A33] command not found");

            }

            promptInput.disabled = true;

            this.createPrompt();

            this.promptIndex++;

        }

    }

}

const promptConnector = new PromptConnector();

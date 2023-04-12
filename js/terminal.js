const PromptDefault = "PS C:\\Users\\thinkpad> ";

const titleCard = [
  "[#F9ED69]               ,--,                                                               |          ",
  "[#F9ED69]            ,---.'|                                ,--.                          - -         ",
  "[#F9ED69]  ,----..   |   | :       ,---,   ,----..      ,--/  /|     ,---,. ,-.----.       |          ",
  "[#F9ED69] /   /   \\  :   : |    ,`--.' |  /   /   \\  ,---,': / '   ,'  .' | \\    /  \\           ,---, ",
  "[#F08A5D]|   :     : |   ' :    |   :  : |   :     : :   : '/ /  ,---.'   | ;   :    \\         /_ ./| ",
  "[#F08A5D].   |  ;. / ;   ; '    :   |  ' .   |  ;. / |   '   ,   |   |   .' |   | .\\ :   ,---, |  ' : ",
  "[#F08A5D].   ; /--`  '   | |__  |   :  | .   ; /--`  '   |  /    :   :  |-, .   : |: |  /___/ \\.  : | ",
  "[#F08A5D];   | ;     |   | :.'| '   '  ; ;   | ;     |   ;  ;    :   |  ;/| |   |  \\ :   .  \\  \\ ,' ' ",
  "[#B83B5E]|   : |     '   :    ; |   |  | |   : |     :   '   \\   |   :   .' |   : .  /    \\  ;  `  ,' ",
  "[#B83B5E].   | '___  |   |  ./  '   :  ; .   | '___  |   |    '  |   |  |-, ;   | |  \\     \\  \\    '  ",
  "[#B83B5E]'   ; : .'| ;   : ;    |   |  ' '   ; : .'| '   : |.  \\ '   :  ;/| |   | ;\\  \\     '  \\   |  ",
  "[#B83B5E]'   | '/  : |   ,/     '   :  | '   | '/  : |   | '_\\.' |   |    \\ :   ' | \\.'      \\  ;  ;  ",
  "[#6A2C70]|   :    /  '---'      ;   |.'  |   :    /  '   : |     |   :   .' :   : :-'         :  \\  \\ ",
  "[#6A2C70] \\   \\ .'              '---'     \\   \\ .'   ;   |,'     |   | ,'   |   |.'            \\  ' ; ",
  "[#6A2C70]  `---`                           `---`     '---'       `----'     `---'               `--`  ",
];

const commandList = ["banner"];

function convertHexToSpan(text) {
  const regex = /\[#([\dA-Fa-f]{6})\]/g; // regex to match color codes
  return text.replace(regex, '<span style="color: #$1">') + "</span>";
}

class PromptConnector {
  constructor() {
    this.promptIndex = 0;
    this.promptContainer = document.createElement("div");
    this.promptContainer.classList.add("prompt-container");
    document.body.appendChild(this.promptContainer);
    this.createPrompt();
  }

  createPrompt() {
    const promptWrapper = document.createElement("div");
    promptWrapper.classList.add("prompt-wrapper");
    const promptText = document.createElement("div");
    promptText.classList.add("prompt-text");
    promptText.textContent = PromptDefault;
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
          for (let i = 0; i < titleCard.length; i++) {
            this.currentPromptOutput.innerHTML +=
              convertHexToSpan(titleCard[i]) + "<br>";
          }
        }
        this.currentPromptOutput.classList.add("pre");
      } else {
        this.currentPromptOutput.innerHTML =
          convertHexToSpan("[#F7C04A]clickery") +
          ": " +
          promptInput.value +
          convertHexToSpan("[#E86A33] command not found") + "<br>";
      }
      promptInput.disabled = true;
      this.createPrompt();
    }
  }
}

const promptConnector = new PromptConnector();

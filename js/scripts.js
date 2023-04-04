const codeBlocks = document.querySelectorAll("code");
codeBlocks.forEach((codeBlock) => {
  const codeText = codeBlock.textContent;
  const words = codeText.trim().split(" ");
  if (words.length === 1) {
    const span = document.createElement("span");
    const randomColor = getRandomBrightColor();
    span.style.color = randomColor;
    
    // Wrap the word in the span element
    const wordNode = document.createTextNode(codeText);
    span.appendChild(wordNode);
    codeBlock.innerHTML = codeBlock.innerHTML.replace(codeText, span.outerHTML);
  }
});

function getRandomBrightColor() {
  // Generate a random color that is bright (i.e., has high value components)
  const h = Math.floor(Math.random() * 360);
  const s = 100; // saturation always 100%
  const l = Math.floor(Math.random() * 40) + 60; // brightness between 60% and 100%
  return `hsl(${h}, ${s}%, ${l}%)`;
}


const time = document.getElementById("time");

setInterval(function () {
time.innerHTML = new Date();
}, 100);

let scrollpos = window.scrollY;
const header = document.querySelector(".navbar");
const header_height = header.offsetHeight;

const add_class_on_scroll = () => header.classList.add("scrolled", "shadow-sm");
const remove_class_on_scroll = () =>
  header.classList.remove("scrolled", "shadow-sm");

window.addEventListener("scroll", function () {
  scrollpos = window.scrollY;

  if (scrollpos >= header_height) {
    add_class_on_scroll();
  } else {
    remove_class_on_scroll();
  }

  console.log(scrollpos);
});

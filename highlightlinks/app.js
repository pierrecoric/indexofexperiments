const textInput = document.getElementById("text");
const textOutput = document.getElementById("activeSelection");
const renderedContent = document.getElementById("renderedContent");

renderedContent.innerHTML = linkify(textInput.value, "");

textInput.addEventListener("selectionchange", () => {
    const inputStart = textInput.selectionStart;
    const inputEnd = textInput.selectionEnd;
    const selectionContent = textInput.value.substring(inputStart, inputEnd);
    textOutput.textContent = selectionContent;
    renderedContent.innerHTML = linkify(textInput.value, selectionContent);
});

function linkify(text, link) {
  const escapedLink = link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedLink, 'g');
  return text.replace(regex, `<a href="https://www.google.com/search?q=${link}" target="blank">${link}</a>`);
}
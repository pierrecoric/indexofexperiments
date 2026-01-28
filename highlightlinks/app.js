const textInput = document.getElementById("text");
const textOutput = document.getElementById("activeSelection");
const renderedContent = document.getElementById("renderedContent");

renderedContent.innerHTML = linkify(textInput.value, "");

let selectionFlag = false;

textInput.addEventListener("selectionchange", () => {
  const inputStart = textInput.selectionStart;
  const inputEnd = textInput.selectionEnd;
  const selectionContent = textInput.value.substring(inputStart, inputEnd);
  textOutput.textContent = selectionContent;
  //Make sure to only render when the selection contains something.
  if (selectionContent.length > 0) {
    selectionFlag = true;
    renderedContent.innerHTML = linkify(textInput.value, selectionContent);
  }
  else {
    if (selectionFlag) {
      selectionFlag = false;
      renderedContent.innerHTML = linkify(textInput.value, "");
    }
  }
});

function linkify(text, link) {
  const escapedLink = link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedLink, 'g');
  return text.replace(regex, `<a href="https://www.google.com/search?q=${link}" target="blank">${link}</a>`);
}
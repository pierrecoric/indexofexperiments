const textEditor = document.getElementById("textEditor");
const readableText = document.getElementById("readableText");
const footnotesEditor = document.getElementById("footnotesEditor");

let bracketItems = [];

//When page is loaded.
readableText.innerHTML = renderText(textEditor.value);

textEditor.addEventListener("input", (event) => {
    readableText.innerHTML = renderText(textEditor.value);
    bracketItems = listFootnotes(textEditor.value);
    renderFootnotesEditor();
});

function renderText(text) {
    return text.replace(/\[([^\[\]]{1,10})\]/g, "<sup>$1</sup>");
}

function renderFootnotesEditor() {
    footnotesEditor.innerHTML = "";
    for (const element of bracketItems) {
        const newFootnote = document.createElement("div")
        const newTextArea = document.createElement("textarea");
        const reference = document.createElement("span");
        reference.innerText = element;
        newFootnote.appendChild(reference);
        newFootnote.appendChild(newTextArea);
        footnotesEditor.appendChild(newFootnote);
    }
}

function listFootnotes(text) {
    const regex = /\[([^\[\]]{1,10})\]/g;
    const items = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        items.push(match[1]);
    }
    return items;
}


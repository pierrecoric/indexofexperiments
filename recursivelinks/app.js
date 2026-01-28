const textEditor = document.getElementById("textEditor");
const selectionPreview = document.getElementById("selectionPreview");
const readableText = document.getElementById("readableText");
const linkifyingButton = document.getElementById("linkifyingButton")
const listOfLinks = document.getElementById("listOfLinks");
let selectionFlag = false;
let selectionContent = "";
let linksCurrentPage = [];

let listOfDeleteLinkButtons = [];




//When page is loaded.
readableText.innerHTML = linkify(textEditor.value);

//When the user highlights something in the editor.
textEditor.addEventListener("selectionchange", () => {
    const inputStart = textEditor.selectionStart;
    const inputEnd = textEditor.selectionEnd;
    selectionContent = textEditor.value.substring(inputStart, inputEnd);
    selectionPreview.setAttribute("href", `https://www.google.com/search?q=${selectionContent}`);;
    selectionPreview.setAttribute("target", "blank")
    selectionPreview.textContent = selectionContent;
});

textEditor.addEventListener("input", (event) => {
    readableText.innerHTML = linkify(textEditor.value);
});


//When the user clicks the button.
linkifyingButton.addEventListener("click", () => {
    //In case of empty selection.
    if (!selectionContent) return;
    //Then pushing the lower case link to the list of links if not present yet.
    const lowerCaseLink = selectionContent.toLocaleLowerCase();
    if (!linksCurrentPage.includes(lowerCaseLink)) {
        linksCurrentPage.push(lowerCaseLink);
        //Sorting from the longest to the shortest.
        linksCurrentPage = longestToShortest(linksCurrentPage);
        readableText.innerHTML = linkify(textEditor.value);
        //Display the list of links.
        renderLinks(linksCurrentPage);
    }
});


function linkify(text) {
    //In case of empty list.
    if (linksCurrentPage.length === 0) return text;

    const escapedLinks = linksCurrentPage.map(link =>
        link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedLinks.join('|')})`, 'gi');

    return text.replace(regex, (match) => `<a href="https://www.google.com/search?q=${match.toLowerCase()}" target="blank">${match}</a>`);
}

//Function to refresh the list of links. Alphabetically.
function renderLinks (array) {
    array.sort();
    listOfLinks.innerHTML = "";
    for (const link of array) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const btn = document.createElement("button");
        a.innerHTML = `<a href="https://www.google.com/search?q=${link}" target="blank">${link}</a>`;
        btn.innerText = `X`;
        btn.value = link;
        btn.classList.add("deleteLinkBtn");
        li.appendChild(btn);
        li.appendChild(a);
        listOfLinks.appendChild(li);
    }
    listOfDeleteLinkButtons = document.getElementsByClassName("deleteLinkBtn");
    //Add event listeners to all the links.
    for (var i = 0; i < listOfDeleteLinkButtons.length; i++) {
        listOfDeleteLinkButtons[i].addEventListener('click', deleteLink);
    }
}


function deleteLink (event) {
    event.preventDefault();
    linksCurrentPage = linksCurrentPage.filter(link => link !== event.target.value);
    readableText.innerHTML = linkify(textEditor.value);
    renderLinks(linksCurrentPage);
}


function longestToShortest (array) {
   return array.sort((y,x) => x.length - y.length);
}


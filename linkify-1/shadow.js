//An array of all shadow divs
let shadows = document.getElementsByClassName("shadow")

//looping through the shadow divs
for (let i = 0; i < shadows.length; i++) {
	//getting the inside of the div
	let shadowSource = shadows[i].innerHTML;
	//splitting the content into words
	let shadowWords = shadowSource.split(" ");
	//reseting the inside of the div
	shadows[i].innerHTML = ""
	//looping through all the words and linkifying them
	for (let a = 0; a < shadowWords.length; a++) {
		console.log(shadowWords[a]);
		//shadows[i].innerHTML += linkify(shadowWords[a], ` href=#`) + " ";
		shadows[i].innerHTML += linkify(shadowWords[a], ` target="_blank" href="https://www.google.com/search?q=`) + " "
	}
}

//turns a word into a link, flag being the conte 
function linkify (word, flag) {
	let newLink = `<a${flag}${word}">${word}</a>`;
	return(newLink);
}


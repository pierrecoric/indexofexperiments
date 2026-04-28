//get the button
let linkifyTrigger = document.getElementById("linkify");
//get the texteArea
let linkifySource = document.getElementById("story");

//get the div for the result
let shadow = document.getElementById("shadow")

//when the button is clicked
linkifyTrigger.onclick = function(){
	//get the content of the textarea
	let source = linkifySource.value;
	linkifySource.value = "";
	let words = source.split(/ |\n/);
	for (let a = 0; a < words.length; a++) {
		shadow.innerHTML += linkify(words[a], ` target="_blank" href="https://www.google.com/search?q=`) + " "
	}
}



//turns a word into a link, flag being the conte 
function linkify (word, flag) {
	//check if the character is alphabetical, start the link once it is
	//check if the last character is alphabetical or not
	//if it is not, stop the link beofre the last character.
	let start = "";
	let content = word
	let tail = "";
	let alpha = false;

	//build the start
	for (n = 0; n < word.length; n++) {
		if(isLetter(word.charAt(n))) { break; }
		start += word.charAt(n);
	}
	//build the tail
	if(start.length != word.length) {
		for (n = word.length - 1; n > 0; n--) {
			if(isLetter(word.charAt(n))) { break ;}
			tail += word.charAt(n);
		}
	}
	else {
		content = "";
	}
	//content = word - tail - start
	content = word.slice(start.length, word.length - tail.length);

	let newLink = `${start}<a${flag}${content}">${content}</a>${tail}`;
	return(newLink);
}

function isLetter(s)
{
  return s.match(/[\p{Letter}]+/gu);    
}


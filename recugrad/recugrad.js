//get the buttons
let recuTrigger = document.getElementById("recugrad");
let clearTrigger = document.getElementById("clear");

//get the texteArea
let recuSource = document.getElementById("story");

//get the div for the result;
let recuResult = document.getElementById("recuResult");

let source = "";
//when the button is clicked
recuTrigger.onclick = function(){
	recuResult.innerHTML = "";
	//get the content of the textarea
	source += recuSource.value;
	//make a sorted array with only the letters of the text.
	let onlyLetters = keepLetters(source);
	let letters = [];
	//create an array to store the reccurency of each character
	let charRec = [];
	for (let i = 0; i < onlyLetters.length; i ++) {
		letters.push(onlyLetters.charAt(i));
	}
	//there it is
	letters = letters.sort();
	//create entry in char Rec for each letter
	charRec.push(makeCharRec(letters[0], 0));
	for (let i = 1; i < letters.length; i ++) {
		if(letters[i] != letters[i-1]) {
			charRec.push(makeCharRec(letters[i], 0));
		}
	}
	//increment occurence for each letter
	for (let i = 0; i < letters.length; i ++) {
		for(let n = 0; n < charRec.length; n++) {
			if (letters[i] == charRec[n].letter) {
				charRec[n].occurences ++;
				break;
			}
		}
	}

	//find highest and lowest
	let highest = 0;
	let lowest = 100000;
	for (let i = 0; i < charRec.length; i ++) {
		if (charRec[i].occurences > highest) {
			highest = charRec[i].occurences;
		}
		if (charRec[i].occurences < lowest) {
			lowest = charRec[i].occurences;
		}
	}
	
	//iterate over the source and add classname for each letter
	for (let i = 0; i < source.length; i ++) {
		let displayed = false;
		for(let n = 0; n < charRec.length; n ++) {
			if(source.charAt(i) == charRec[n].letter) {
				recuResult.innerHTML += "<span class=\"r" + Math.round(mapitos(charRec[n].occurences, lowest, highest, 0, 240)) + "\">" + source.charAt(i) + "<\span>";
				displayed = true;
				break;
			}
		}
		if (displayed == false) {
			recuResult.innerHTML += "<span class=\"r" + 10000 + "\">" + source.charAt(i) + "<\span>";
		}
	}
}

clearTrigger.onclick = function() {
	recuResult.innerHTML = "";
	source = ""
}

//function that returns null if a char is not a letter
function isLetter(s)
{
  return s.match(/[\p{Letter}]+/gu);    
}

//function that only keeps the letters in a string
function keepLetters (source) {
	let result = "";
	for (let i = 0; i < source.length; i++) {
		if (isLetter(source.charAt(i)) != null) {
			result += source.charAt(i);
		}
	}
	return result;
}

//
function makeCharRec (letter, occurences) {
	return {
		letter: letter,
		occurences: occurences
	};
}

function mapitos(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}


function makeStyle(value) {
	return `.r${value}{color:rgb(${value},${value},${value});} `
}

/*
for(let i = 0; i < 256; i ++) {
	recuResult.innerHTML += makeStyle(i) + "<br>";
}
*/


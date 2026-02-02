//get the buttons
let sortextTrigger = document.getElementById("sortext");
let cutTrigger = document.getElementById("cut");
let clearTrigger = document.getElementById("clear");

let isCut = false;

//get the texteArea
let sortextSource = document.getElementById("story");

//get the div for the result
let sorted = document.getElementById("sorted")

//safe version of the content 
let safe = ""


//when the button is clicked
sortextTrigger.onclick = function(){
	//get the content of the textarea
	let source = sortextSource.value;
	//only get the letters of the source
	sorted.innerHTML += keepLetters(source);
	//then sort the sorted div
	source = keepLetters(sorted.innerHTML);
	let letters = [];
	for (let i = 0; i < source.length; i ++) {
		letters.push(source.charAt(i));
	}
	sorted.innerHTML = "";
	letters = letters.sort();
	for (let i = 0; i < letters.length; i++) {
		sorted.innerHTML += letters[i];
	}
	safe = sorted.innerHTML;
	cutTrigger.innerHTML = "cut";
	isCut = false;
}


cutTrigger.onclick = function(){
	source = sorted.innerHTML;
	if (isCut == false) {
		safe = source;
		//add \n everytime a char is different than the previous one
		sorted.innerHTML = "";
		sorted.innerHTML += source.charAt(0);
		for (let i = 1; i < source.length; i ++) {
			if (source.charAt(i) != source.charAt(i - 1)) {
				sorted.innerHTML += '<br><br>';
			}
			sorted.innerHTML += source.charAt(i);
		}
		cutTrigger.innerHTML = "restore";
		isCut = true;
	}
	else {
		sorted.innerHTML = safe;
		cutTrigger.innerHTML = "cut";
		isCut = false;
	}
}

clearTrigger.onclick = function() {
	sorted.innerHTML = "";
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

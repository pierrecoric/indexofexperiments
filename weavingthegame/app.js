//The following fields have to be picked by the user.
//----------------------------------------
let widthFrame = 400; //number picker
let heightWeaving = 400; //number picker
//Dimensions of the individual cells. 
let cellSize = 8; //sliders with range (4 - 50)
let tail = 1; //slider with range (1 - 10)
//Thread thickness.
let threadThickness = 3; //slider with (range 1 - 20)
//Frames. text field (need a function to handle it)
//e.g. of correct user input: "ooxx, oxxo, xxoo, xoox"
//The example would give the following array of strings.
let frames = ["ooxx",
    "oxxo",
    "xxoo",
    "xoox"];
//Color Sequence.
let colorSequence = "aaabbbdddaaadddbbcececececececccccecececeeee"; //text field
//Colors. //Color pickers
let colorA
let colorB
let colorC
let colorD
let colorE
//----------------------------------------

//Calculating the amount of frames and the sequence length.
let amountFrames = frames.length;
let sequenceLength = colorSequence.length;
//Initialize an empty array.
let weaving = Array.from({ length: heightWeaving }, () =>
    Array(widthFrame).fill('')
);

//Setup function.
function setup() {
    //Create a function to update color definitions.
    colorA = color("#e63946");
    colorB = color(182, 23, 23);
    colorC = color(12, 243, 89);
    colorD = color(232, 50, 89);
    colorE = color(150, 10, 100);

    createCanvas(windowWidth, windowHeight);
    populateArray();
    preview();
}

function populateArray() {
    frames = parseFrames(document.getElementById("framesInput").value);
    amountFrames = frames.length;

    weaving = Array.from({ length: heightWeaving }, () =>
        Array(widthFrame).fill('')
    );

    for (let y = 0; y < heightWeaving; y++) {
        let currentFrame = y % amountFrames;
        let currentLine = [];
        for (let x = 0; x < widthFrame; x++) {
            let lengthCurrentFrame = frames[currentFrame].length;
            let position = x % lengthCurrentFrame;
            let thread = frames[currentFrame][position];
            currentLine[x] = thread;
        }
        weaving[y] = currentLine;
    }

    preview();
}

//Function to preview the weave.
//To do: make it fullscreen.
function preview() {
    background(255);
    strokeWeight(threadThickness);
    for (let y = 0; y < heightWeaving; y++) {
        for (let x = 0; x < widthFrame; x++) {
            let horizontalColorPosition = x % sequenceLength;
            let verticalColorPosition = y % sequenceLength;
            let xColor = colorSequence[horizontalColorPosition];
            let yColor = colorSequence[verticalColorPosition];

            if (weaving[y][x] == 'o') {
                colorSwitcher(xColor);
                line(x * cellSize + cellSize / 2,
                    y * cellSize,
                    x * cellSize + cellSize / 2,
                    y * cellSize + cellSize
                );
                colorSwitcher(yColor);
                line(x * cellSize,
                    y * cellSize + cellSize / 2,
                    x * cellSize + tail,
                    y * cellSize + cellSize / 2
                );
                line(x * cellSize + cellSize - tail,
                    y * cellSize + cellSize / 2,
                    x * cellSize + cellSize,
                    y * cellSize + cellSize / 2
                );
            }
            else {
                colorSwitcher(yColor);
                line(x * cellSize,
                    y * cellSize + cellSize / 2,
                    x * cellSize + cellSize,
                    y * cellSize + cellSize / 2
                );
                colorSwitcher(xColor);
                line(x * cellSize + cellSize / 2,
                    y * cellSize,
                    x * cellSize + cellSize / 2,
                    y * cellSize + tail
                );
                line(x * cellSize + cellSize / 2,
                    y * cellSize + cellSize - tail,
                    x * cellSize + cellSize / 2,
                    y * cellSize + cellSize
                );
            }
        }
    }
}

//Function to switch color.
function colorSwitcher(t) {
    switch (t) {

        case 'a':
            stroke(colorA);
            break;

        case 'b':
            stroke(colorB);
            break;

        case 'c':
            stroke(colorC);
            break;

        case 'd':
            stroke(colorD);
            break;

        case 'e':
            stroke(colorE);
            break;

        default:
            stroke(0);
            break;
    }
}

function change() {
    // Numeric fields
    widthFrame = parseInt(document.getElementById("widthFrame").value, 10);
    heightWeaving = parseInt(document.getElementById("heightWeaving").value, 10);
    cellSize = parseInt(document.getElementById("cellSize").value, 10);
    tail = parseInt(document.getElementById("tail").value, 10);
    threadThickness = parseInt(document.getElementById("threadThickness").value, 10);
    let rawSequence = document.getElementById("colorSequence").value;

    colorSequence   = document.getElementById("symmetric").checked
                        ? mirrorSequence(rawSequence)
                        : rawSequence;
    sequenceLength  = colorSequence.length;

   

    // Color pickers
    colorA = document.getElementById("colorA").value;
    colorB = document.getElementById("colorB").value;
    colorC = document.getElementById("colorC").value;
    colorD = document.getElementById("colorD").value;
    colorE = document.getElementById("colorE").value;

    preview();
}

function parseFrames(input) {
    return input
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
}

["widthFrame", "heightWeaving", "cellSize", "tail", "threadThickness", "colorSequence", "symmetric",
    "colorA", "colorB", "colorC", "colorD", "colorE"
].forEach(id => {
    document.getElementById(id).addEventListener("input", change);
});

document.getElementById("framesInput").addEventListener("input", populateArray);

function mirrorSequence(seq) {
    return seq + seq.split('').reverse().join('');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    preview();
}

function bindRange(id, labelId) {
    const input = document.getElementById(id);
    const label = document.getElementById(labelId);
    label.textContent = input.value;
    input.addEventListener('input', () => {
        label.textContent = input.value;
    });
}

bindRange('cellSize', 'cellSizeVal');
bindRange('tail', 'tailVal');
bindRange('threadThickness', 'threadThicknessVal');
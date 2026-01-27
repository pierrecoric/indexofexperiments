//Two Dimensional Array with the of the schema
let dataSchema = [];
let masterSchemaData = [];
let cellSize = 30;
let minCellSize = 5;
let maxCellSize = 50;
let amountCellsX = 4;
let amountCellsY = 4;
let extraSquares = 3;

let abstractionMarginX = 0;
let abstractionMarginY = 0;
let schemaMarginX = 0;
let schemaMarginY = 0;
let schemaMarginLeft = 0;
let abstractionOffset = 0;
let widthAbstraction = 0;
let heightAbstraction = 0;
let totalWidth = 0;
let widthSchema = 0;
let heightSchema = 0;

function refreshDimensions() {

    //Compute the cell Size. Min 5 max 35;
    //The width of the whole thing = widthAbstraction + widthSchema + schemaMarginLeft (+ 3 = margin for the connections)
    let totalSquaresX = (extraSquares * 2) + (amountCellsX * 2) - 1 + amountCellsX + 3;
    let totalSquaresY = (extraSquares * 2) + (amountCellsY * 2) - 1 + amountCellsY; 

    

    //Compute the size
    cellSize = (width - (50)) / totalSquaresX; 

    //Check if we need space horizontally
    if( (totalSquaresX * cellSize) > (width - (4*cellSize))) {
        cellSize = (width - (4*cellSize)) / totalSquaresX; 
    }
    //Check if we need space vertically
    if((totalSquaresY * cellSize) > (height - (4*cellSize))) {
        cellSize = (height - (4*cellSize)) / totalSquaresY;
    }

    //Constraint it into the min and max.
    if(cellSize < minCellSize) {
        cellSize = minCellSize;
    }
    if(cellSize > maxCellSize) {
        cellSize = maxCellSize;
    }

    totalWidth = totalSquaresX * cellSize;

    schemaMarginLeft = 3 * cellSize;
    abstractionOffset = extraSquares * cellSize;
    widthAbstraction = (amountCellsX * 2 * cellSize) - cellSize + (2 * abstractionOffset);
    heightAbstraction = (amountCellsY * 2 * cellSize) - cellSize  + (2 * abstractionOffset);
    widthSchema = amountCellsX * cellSize;
    heightSchema = amountCellsY * cellSize;
    //Margins of the abstraction
    abstractionMarginX = (width - totalWidth) / 2  + (abstractionOffset);
    abstractionMarginY = (height - heightAbstraction) / 2 + (abstractionOffset);
    //Margins of the schema
    schemaMarginX = abstractionMarginX + widthAbstraction - abstractionOffset + schemaMarginLeft;
    schemaMarginY = (height - (cellSize * amountCellsY)) / 2;

    //Allign margins on the grid.
    schemaMarginX = roundOnGrid(schemaMarginX);
    schemaMarginY = roundOnGrid(schemaMarginY);
    abstractionMarginX = roundOnGrid(abstractionMarginX);
    abstractionMarginY = roundOnGrid(abstractionMarginY);

}

//Colors
let colorLines;
let colorBg;
let colorControl;

//Stroke levels
let strokeThin = 1;
let strokeRegular = 2;
let strokeBold = 4;


//Function to populate the initial array
function populate(oldData = []) {
    let newArray = []
    for (let x = 0; x < amountCellsX; x++) {
        let line = new Array(amountCellsY);
        for (let y = 0; y < amountCellsY; y++) {
            if (oldData?.[x] !== undefined && (oldData[x][y] === 0 || oldData[x][y] === 1)) {
                line[y] = oldData[x][y];
            } else {
                line[y] = 0;
            }
        }
        newArray.push(line);
    }
    return newArray;
}


function setup() {
    //Populate empty 2D array
    dataSchema = populate(dataSchema);
    //Create canvas.
    let cnv =createCanvas(windowWidth, windowHeight);
    cnv.elt.addEventListener("contextmenu", e => e.preventDefault());
    cnv.style('display', 'block');
    //Define the colors
    colorLines = color(210,210,255);
    colorBg = color(250);
    colorControl = color(20,20,255);
    refreshDimensions();
    refreshScreen();
}

function draw() {
    drawGridFromScratch();
    hoverGrid();
    if(mouseIsPressed) {
        updateWhenMouse();
    }
}

//Recompute geometry and re display on window resize.
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    refreshDimensions();
    refreshScreen();
}

//When the mouse is clicked.
function updateWhenMouse() {
    updateGrid();  
    hoverGrid();
}

function refreshScreen() {
    drawMegaGrid();
    abstractionFromScratch();   
    drawConnections();
    drawGridFromScratch();
}

function drawGridFromScratch() {
    stroke(0);
    strokeWeight(strokeRegular);
    for(let y = 0; y < amountCellsY; y++) {
        for(let x = 0; x < amountCellsX; x++) {
            if(dataSchema[x][y] == 0) {
                fill(255);
            } else fill(0);
            rect(schemaMarginX + x * cellSize, schemaMarginY + y * cellSize, cellSize, cellSize);
        }
    }
}

function hoverGrid() {
    let x = int((mouseX - schemaMarginX) / cellSize);
    let y = int((mouseY - schemaMarginY) / cellSize);
    if(x >= 0 && x < amountCellsX && y >= 0 && y < amountCellsY) {
        noFill();
        stroke(colorControl)
        strokeWeight(strokeBold);
        rect(x * cellSize + schemaMarginX, 
            y * cellSize + schemaMarginY, 
            cellSize, 
            cellSize);
    }
}

function updateGrid() {
    let x = int((mouseX - schemaMarginX) / cellSize);
    let y = int((mouseY - schemaMarginY) / cellSize);
    if(x >= 0 && x < amountCellsX && y >= 0 && y < amountCellsY) {
        if(mouseButton == LEFT) {
            dataSchema[x][y] = 1;
            fill(0);
            noStroke();
            rect(
                2 * x * cellSize + abstractionMarginX,
                2 * y * cellSize + abstractionMarginY,
                cellSize,
                cellSize
            );
        } 
        else {
            dataSchema[x][y] = 0;
            fill(255);
            noStroke();
            rect(
                2 * x * cellSize + abstractionMarginX,
                2 * y * cellSize + abstractionMarginY,
                cellSize,
                cellSize
            );
            //Add line on top and at the bottom
            stroke(0);
            strokeWeight(strokeRegular);
            line(
                2 * x * cellSize + abstractionMarginX,
                2 * y * cellSize + abstractionMarginY,
                2 * x * cellSize + abstractionMarginX + cellSize,
                2 * y * cellSize + abstractionMarginY,
            );
            line(
                2 * x * cellSize + abstractionMarginX,
                2 * y * cellSize + abstractionMarginY + cellSize,
                2 * x * cellSize + abstractionMarginX + cellSize,
                2 * y * cellSize + abstractionMarginY + cellSize,
            );
        }
        stroke(0);
        stroke(strokeRegular);
        rect(schemaMarginX + x * cellSize, schemaMarginY + y * cellSize, cellSize, cellSize);
    } 
}

function mouseReleased() {
    refreshScreen();
}

function basisAbstraction() {
    noStroke();
    //Draw the black basis
    for(let x = 0; x < amountCellsX; x ++) {
        fill(0);
        //Black Rectangle
        rect(
            2 * x * cellSize + abstractionMarginX,
            abstractionMarginY - (abstractionOffset),
            cellSize,
            (amountCellsY * 2 * cellSize) - cellSize  + (2 * abstractionOffset)
        );
    }

    //Draw the white basis
    for(let y = 0; y < amountCellsY; y ++) {
        //3 extra squares
        fill(255);
        stroke(strokeRegular);
        strokeWeight(2);
        rect(abstractionMarginX - (abstractionOffset), 
             2 * y * cellSize + abstractionMarginY,
             (amountCellsX * 2 * cellSize) - cellSize + (2 * abstractionOffset),
             cellSize );
    }
}

function abstractionFromScratch() {
    basisAbstraction();
    //Add black blocks to show the abstraction
    //Improve by doing this on the fly.
    for(let y = 0; y < amountCellsY; y++) {
        for(let x = 0; x < amountCellsX; x++) {
            if(dataSchema[x][y] == 1) {
                fill(0);
                noStroke();
                rect(
                    2 * x * cellSize + abstractionMarginX,
                    2 * y * cellSize + abstractionMarginY,
                    cellSize,
                    cellSize
                );
            }    
        }
    }
}

//Connect the schema and the abstraction
function drawConnections() {
    stroke(strokeRegular);
    for(let y = 0; y < amountCellsY; y++) {
        line(
            abstractionMarginX + widthAbstraction - (abstractionOffset),
            2 * y * cellSize + abstractionMarginY + (cellSize / 2),
            schemaMarginX,
            schemaMarginY + y * cellSize + (cellSize / 2)
        );
    }
}

//Draw the background Grid
function drawMegaGrid() {
    stroke(colorLines);
    strokeWeight(strokeThin);
    fill(colorBg);
    for(let y = 0; y < height / cellSize; y++) {
        for(let x = 0; x < width / cellSize; x ++) {
            rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

//Helper function to allign on the grid.
function roundOnGrid(n) {
    return int(n / cellSize) * cellSize;
}



//Use the form to change the size of the thing.
let formSize = document.getElementById("formSize");
function handleFormSize(event) {
    event.preventDefault();
    let newWidth = document.getElementById("newWidthSchema").value;
    let newHeight = document.getElementById("newHeightSchema").value;
    resizeSchema(newWidth, newHeight);
}

function resizeSchema(w, h) {
    amountCellsX = int(w);
    amountCellsY = int(h);
    dataSchema = populate(dataSchema);
    refreshDimensions();
    refreshScreen();
}

formSize.addEventListener("submit", handleFormSize);



//TODO
//Geometry

//Expansions
    //Make a system to write up the pattern
    //Repetition of the pattern
    //Invert Pattern
    //Select a part of the pattern as the pattern
    //Function that gives the smalles amount of frames to reproduce the pattern.

//Web
    //Remove margins around the canvas
    //
//////////////////// ESCENARIO ////////////////////

const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

const canvasDimention = 800;
const sizePercentage = 0.8;

const matrix = []
const sprites = new Map();
async function loadImages() {
    sprites.set('2', await addImage('player.png'))
    sprites.set('3', await addImage('star.png'))
    sprites.set('4', await addImage('flower.png'))
    sprites.set('5', await addImage('koopa.png'))
    sprites.set('6', await addImage('goal.png'))
}

function drawSquares(width, height) {
    const squareWidth = canvasDimention/width;
    const squareHeight = canvasDimention/height;
    for (let i=0; i<width; i++) {
        for (let j=0; j<height; j++) {
            squareColor(squareWidth, squareHeight, i, j)
            squareBorder(squareWidth, squareHeight, i, j)
            drawSprites(squareWidth,squareHeight,i, j)
        }
    }
}

function squareColor(width, height, row, column) {
    const color = matrix[row][column] == 1 ? 'saddlebrown' : 'white';
    context.fillStyle = color;
    context.fillRect(width*column, height*row, width, height);
}

function squareBorder(width, height, row, column) {
    const posX = width*column;
    const posY = height*row;
    context.beginPath();
    context.moveTo(posX, posY);
    context.lineTo(posX + width, posY);
    context.lineTo(posX + width, posY + height);
    context.lineTo(posX, posY + height);
    context.closePath();
    context.stroke();
}

function drawSprites(cellWidth, cellHeight, row, column) {
    const img = sprites.get(matrix[row][column]) || null;
    if (img) {
        drawSprite(img,cellWidth, cellHeight, row, column)
    }
}

function drawSprite(img, cellWidth, cellHeight, row, column) {
    const h = cellHeight * sizePercentage // image height
    const w = img.width * h / img.height; // image width
    const posX = cellWidth/2 - w/2 + cellWidth*column;
    const posY = cellHeight/2 - h/2 + cellHeight*row;
    context.drawImage(img, posX, posY, w, h);
}

function addImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    })
}

function fillMatrix(txt) {
    const text = txt.trim();
    const rows = text.split('\r\n');
    for (let i = 0; i<rows.length; i++) {
        const columns = rows[i].split(' ');
        matrix[i] = new Array(columns.length)
        for (let j = 0; j<columns.length; j++) {
            matrix[i][j] = columns[j];
        }
    }
}

fetch('escenario.txt').then(res => {
    res.text().then(txt => {
        fillMatrix(txt);
        loadImages().then(()=>{
            drawSquares(matrix[0].length, matrix.length);
        });
    })
})

//////////////////// FORMULARIO ////////////////////

function radioButtonHandler(bool) {
    const opciones1 = document.getElementById("opciones1");
    const opciones2 = document.getElementById("opciones2");
    const label = document.getElementById("label");
    const submit = document.getElementById("submit");
    label.style.display = 'block';
    submit.style.display = 'block';
    if (bool) {
        opciones1.style.display = 'block';
        opciones2.style.display = 'none';
    } else {
        opciones1.style.display = 'none';
        opciones2.style.display = 'block';
    }
}

function runScene() {
    const opciones1 = document.getElementById("opciones1");
    const opciones2 = document.getElementById("opciones2");
    if (opciones1.style.display != 'none') {
        switch (opciones1.value) {
            case 'amplitud': amplitud(); break;
            case 'uniforme': costoUniforme(); break;
            default: noCiclos(); break;
        }
    } else {
        switch (opciones2.value) {
            case 'avara': avara(); break;
            default: a(); break;
        }
    }
}

////////////////// ALGORITMOS IA //////////////////

function amplitud() {
    animate(moves);
}

function costoUniforme() {
    console.log("costo uniforme");
}

function noCiclos() {
    console.log("profundidad evitando ciclos");
}

function avara() {
    console.log("Avara");
}

function a() {
    console.log("a*");
}

function playerPos() {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if(matrix[i][j] == '2') {
                return [i,j]
            }
        }
    }
}

//////////////////// ANIMACIÓN ////////////////////

const velocity = 250;
const moves = ['D','R','R','D','R','R','R','R','R','R','R','D','D','L','L']

async function animate(moves) {
    for (const e of moves) {
        moveOne(e);
        await sleep(velocity)
    }
}

function moveOne(move) {
    const pos = playerPos();
    if (move.length == 1) {
        matrix[pos[0]][pos[1]] = '0';
    } else if (move.substring(1,2) == 'S') {
        matrix[pos[0]][pos[1]] = '3';
    } else if (move.substring(1,2) == 'F') {
        matrix[pos[0]][pos[1]] = '4';
    } else if (move.substring(1,2) == 'K') {
        matrix[pos[0]][pos[1]] = '5';
    }
    if (move.substring(0,1) == 'T') {
        matrix[pos[0] - 1][pos[1]] = '2';
    } else if (move.substring(0,1) == 'D') {
        matrix[pos[0] + 1][pos[1]] = '2';
    } else if (move.substring(0,1) == 'L') {
        matrix[pos[0]][pos[1] - 1] = '2';
    } else if (move.substring(0,1) == 'R') {
        matrix[pos[0]][pos[1] + 1] = '2';
    }
    drawSquares(matrix[0].length, matrix.length);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
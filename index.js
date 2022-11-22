//////////////// MOSTRAR ESCENARIO ////////////////

const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

const canvasDimention = 800;
const sizePercentage = 0.8;
let = nodosExpandidos = 0;
let = nodosTotales = 1;
let profundidad = 0;
let tiempo = 0;

const sprites = new Map();
async function loadImages() {
    sprites.set('2', await addImage('player.png'))
    sprites.set('3', await addImage('star.png'))
    sprites.set('4', await addImage('flower.png'))
    sprites.set('5', await addImage('koopa.png'))
    sprites.set('6', await addImage('goal.png'))
}

function drawSquares(matrix) {
    const matrixWidth = matrix[0].length;
    const matrixLength = matrix.length;
    const squareWidth = canvasDimention/matrixWidth;
    const squareHeight = canvasDimention/matrixLength;
    for (let i=0; i<matrixWidth; i++) {
        for (let j=0; j<matrixLength; j++) {
            squareColor(matrix, squareWidth, squareHeight, i, j)
            drawSprites(matrix, squareWidth,squareHeight, i, j)
            squareBorder(squareWidth, squareHeight, i, j)
        }
    }
}

function squareColor(matrix, width, height, row, column) {
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

function drawSprites(matrix, cellWidth, cellHeight, row, column) {
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
    nodosExpandidos = 0;
    nodosTotales = 1;
    profundidad = 0;
    const node = new Node(matrix, null, '', 0, 0, 0, 0)
    const opciones1 = document.getElementById("opciones1");
    const opciones2 = document.getElementById("opciones2");
    let moves = [];
    if (opciones1.style.display != 'none') {
        switch (opciones1.value) {
            case 'amplitud': moves = aiAlgorithm(node, amplitud); break;
            case 'uniforme': moves = aiAlgorithm(node, costoUniforme); break;
            default: moves = aiAlgorithm(node, profundidadNoCiclos); break;
        }
    } else {
        switch (opciones2.value) {
            case 'avara': moves = aiAlgorithm(node, avara); break;
            default: moves = aiAlgorithm(node, a); break;
        }
    }
    animate(moves)
}

////////////////// ALGORITMOS IA //////////////////

function aiAlgorithm(node, updateQueue) {
    const startTime = performance.now();
    const queue = []
    queue.push(node)
    while (queue.length) {
        let isExpanded = false;
        const nd = queue.shift()
        if (nd.isGoal()) {
            tiempo = performance.now() - startTime;
            return nd;
        }
        const move = movesChar(nd.stage, '2')
        if (move.up && (nd.operator != 'D')) {
            isExpanded = true;
            updateQueue(queue, nd, move.up);
        }
        if (move.right && (nd.operator != 'L')) {
            isExpanded = true;
            updateQueue(queue, nd, move.right);
        }
        if (move.down && (nd.operator != 'U')) {
            isExpanded = true;
            updateQueue(queue, nd, move.down);
        }
        if (move.left && (nd.operator != 'R')) {
            isExpanded = true;
            updateQueue(queue, nd, move.left);
        }
        if (isExpanded) {
            nodosExpandidos++;
        }
    }
}

function amplitud(queue, nd, operator) {
    const leaf = makeLeaf(nd, operator)
    queue.push(leaf);
}


function profundidadNoCiclos(queue, nd, operator) {
    const leaf = makeLeaf(nd, operator)
    if (!leaf.isVIsited(nd)) {
        leaf.addVIsited(nd)
        queue.unshift(leaf)
    }
}

function costoUniforme(queue, nd, operator) {
    const leaf = makeLeaf(nd, operator)
    for (let i=0; i<=queue.length; i++) {
        if (i == queue.length) {
            queue.push(leaf);
            break;
        } else if (leaf.weight <= queue[i].weight) {
            queue.splice(i,0,leaf);
            break;
        }
    }
}

function avara(queue, nd, operator) {
    const leaf = makeLeaf(nd, operator)
    const rule = (j) => leaf.getHeuristic() <= queue[j].getHeuristic();
    addToQueue(leaf, queue, nd, rule) 
}

function a(queue, nd, operator) {
    const leaf = makeLeaf(nd, operator)
    const rule = (j) => leaf.getHeuristic()+leaf.weight <= queue[j].getHeuristic()+queue[j].weight;
    addToQueue(leaf, queue, nd, rule) 
}

function addToQueue(leaf, queue, nd, rule) {
    for (let i=0; i<=queue.length; i++) {
        if (!leaf.isVIsited(nd)) {
            leaf.addVIsited(nd);
            if (i == queue.length) {
                queue.push(leaf);
                break
            } else if (rule(i)) {
                queue.splice(i, 0, leaf);
                break
            } 
        }
    }
}

function makeLeaf(nd, operator) {
    const move = nd.applyOperator(operator);
    nodosTotales++;
    if (nd.depth > profundidad) {
        profundidad = nd.depth
    }
    return new Node(move.child, nd, operator, nd.depth+1, move.weight, move.flames, move.stars);
}

class Node {
    constructor(stage, parent, operator, depth, weight, flames, stars){
        this.stage = stage.map((arr) => arr.slice());
        this.parent = parent;
        this.operator = operator;
        this.depth = depth;
        this.weight = weight;
        this.flames = flames;
        this.stars = stars;
        this.visited = parent ? parent.visited.slice() : [];
    }
    applyOperator(operator) {
        const child = this.stage.map((arr) => arr.slice());
        const properties = moveOne(operator, child, '2', this)
        return {
            child: child,
            weight: properties.weight,
            flames: properties.flames,
            stars: properties.stars
        }
    }
    isGoal() {
        const playerPosStr = JSON.stringify(playerPos(this.stage,'2'))
        const goalPosStr = JSON.stringify(playerPos(matrix,'6'))
        return playerPosStr == goalPosStr
    }
    hasFlames() {
        return this.flames > 0;
    }
    hasStars() {
        return this.stars > 0;
    }
    isVIsited(node) {
        const pos = playerPos(node.stage, '2')
        const v = this.visited.some(p=>JSON.stringify(p)==JSON.stringify(pos))
        return v
    }
    addVIsited(node) {
        const pos = playerPos(node.stage, '2')
        this.visited.push(pos)
    }
    getHeuristic() {
        const p = playerPos(this.stage, '2');
        const g = playerPos(this.stage, '6');
        if (g) {
            return Math.sqrt(Math.pow(p[0]-g[0],2)+Math.pow(p[1]-g[1],2))
        }
        return 0
    }
    getParent(node) {
        let relative = this;
        for(let i = 0; i<node-1; i++) {
            relative = relative.parent
        }
        return relative;
    }
}

//////////////////// MOVEMENT ////////////////////

function playerPos(matrix, player) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if(matrix[i][j] == player) {
                return [i,j]
            }
        }
    }
}

function moveOne(move, mtrx, player, node) {
    const pos = playerPos(mtrx, player)
    let playerPlace = node.parent ? node.parent.stage[pos[0]][pos[1]] : '0';
    const nodeProperties = {
        weight: node.weight,
        stars: node.stars,
        flames: node.flames
    }
    if (move == 'U') {
        mtrx[pos[0] - 1][pos[1]] = player;
    } else if (move == 'D') {
        mtrx[pos[0] + 1][pos[1]] = player;
    } else if (move == 'L') {
        mtrx[pos[0]][pos[1] - 1] = player;
    } else if (move == 'R') {
        mtrx[pos[0]][pos[1] + 1] = player;
    }
    if (playerPlace == '0') {
        mtrx[pos[0]][pos[1]] = '0';
        if (node.hasStars()) {
            nodeProperties.stars--;
            nodeProperties.weight+=0.5;
        } else {
            nodeProperties.weight++;
        }
    } else if (playerPlace == '3') {
        if (node.hasFlames()) {
            mtrx[pos[0]][pos[1]] = '3';
            nodeProperties.weight++;
        } else if (node.hasStars()) {
            mtrx[pos[0]][pos[1]] = '0';
            nodeProperties.stars--;
            nodeProperties.stars+=6;
            nodeProperties.weight+=0.5;
        } else {
            mtrx[pos[0]][pos[1]] = '0';
            nodeProperties.weight++;
            nodeProperties.stars+=6;
        }
    } else if (playerPlace == '4') {
        if (node.hasStars()) {
            mtrx[pos[0]][pos[1]] = '4';
            nodeProperties.stars--;
            nodeProperties.weight+=0.5;
        } else {
            mtrx[pos[0]][pos[1]] = '0';
            nodeProperties.weight++;
            nodeProperties.flames++;
        }
    } else if (playerPlace == '5') {
        if (node.hasFlames()) {
            mtrx[pos[0]][pos[1]] = '0';
            nodeProperties.weight++;
            nodeProperties.flames--;
        } else if (node.hasStars()) {
            mtrx[pos[0]][pos[1]] = '5';
            nodeProperties.stars--;
            nodeProperties.weight+=0.5;
        } else {
            mtrx[pos[0]][pos[1]] = '5'
            nodeProperties.weight+=6;
        }
    }
    return nodeProperties;
}

function movesChar(matrix, player) {
    const pos = playerPos(matrix, player)
    const U = matrix[pos[0] - 1] ? matrix[pos[0] - 1][pos[1]] : false;
    const D = matrix[pos[0] + 1] ? matrix[pos[0] + 1][pos[1]] : false;
    const L = matrix[pos[0]][pos[1] - 1] || false;
    const R = matrix[pos[0]][pos[1] + 1] || false;
    return {
        up:  U && (U != '1') ? 'U': false,
        down: D && (D != '1') ? 'D': false,
        left: L && (L != '1') ? 'L': false,
        right: R && (R != '1') ? 'R': false,
    }
}

//////////////////// ANIMACIÓN ////////////////////

const velocity = 250;

async function animate(moves) {
    for (let i=moves.depth; i>0; i--) {
        const parent = moves.getParent(i);
        drawSquares(parent.stage);
        await sleep(velocity)
    }
    showResults()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/////////////// MOSTRAR RESULTADOS ///////////////

function showResults() {
    document.getElementById("resultados").style.display = "block";
    const parrafo = document.getElementById("parrafo");
    parrafo.innerHTML =  `Nodos expandidos: ${nodosExpandidos}\n`;
    parrafo.innerHTML +=  `Nodos Totales: ${nodosTotales}\n`;
    parrafo.innerHTML += `Profundidad del arbol: ${profundidad}\n`;
    parrafo.innerHTML += `Tiempo de computo: ${tiempo} ms`;
}

//////////////// CARGAR ESCENARIO ////////////////

const matrix = []

function fillMatrix(txt, matrix) {
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
        fillMatrix(txt, matrix);
        loadImages().then(()=>{
            drawSquares(matrix);
        });
    })
})
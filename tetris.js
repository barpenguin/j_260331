const canvas = document.getElementById('tetris-board');
const context = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

const SHAPES = [
    [],
    [[1, 1, 1, 1]],           // I
    [[2, 0, 0], [2, 2, 2]],   // J
    [[0, 0, 3], [3, 3, 3]],   // L
    [[4, 4], [4, 4]],          // O
    [[0, 5, 5], [5, 5, 0]],   // S
    [[0, 6, 0], [6, 6, 6]],   // T
    [[7, 7, 0], [0, 7, 7]]    // Z
];

const SCORE_TABLE = [0, 100, 300, 500, 800]; // 0~4줄 클리어 점수

let board = [];
let piece = null;
let nextPieceType = null;
let score = 0;
let level = 1;
let linesTotal = 0;
let gameRunning = false;

const scoreEl = document.getElementById('score-display');
const levelEl = document.getElementById('level-display');
const linesEl = document.getElementById('lines-display');

function initBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function createPiece(typeId) {
    const matrix = SHAPES[typeId].map(row => [...row]);
    return {
        x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2),
        y: 0,
        matrix,
        typeId
    };
}

function randomTypeId() {
    return Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
}

function spawnPiece() {
    const typeId = nextPieceType ?? randomTypeId();
    nextPieceType = randomTypeId();
    piece = createPiece(typeId);

    if (isCollision(piece)) {
        showGameOver();
        gameRunning = false;
    }
}

function isCollision(p) {
    for (let y = 0; y < p.matrix.length; y++) {
        for (let x = 0; x < p.matrix[y].length; x++) {
            if (p.matrix[y][x] === 0) continue;
            const nx = p.x + x;
            const ny = p.y + y;
            if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
            if (ny >= 0 && board[ny][nx] !== 0) return true;
        }
    }
    return false;
}

function merge() {
    piece.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                board[piece.y + y][piece.x + x] = piece.typeId;
            }
        });
    });
}

function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            r++;
            cleared++;
        }
    }
    if (cleared > 0) {
        score += SCORE_TABLE[cleared] * level;
        linesTotal += cleared;
        level = Math.floor(linesTotal / 10) + 1;
        scoreEl.textContent = score;
        levelEl.textContent = level;
        linesEl.textContent = linesTotal;
    }
}

function drop() {
    piece.y++;
    if (isCollision(piece)) {
        piece.y--;
        merge();
        clearLines();
        spawnPiece();
    }
    dropCounter = 0;
}

function hardDrop() {
    while (!isCollision({ ...piece, y: piece.y + 1 })) {
        piece.y++;
    }
    merge();
    clearLines();
    spawnPiece();
    dropCounter = 0;
}

function rotate() {
    const result = piece.matrix[0].map((_, i) =>
        piece.matrix.map(row => row[i]).reverse()
    );
    const original = piece.matrix;
    piece.matrix = result;

    // Wall kick
    let offset = 1;
    while (isCollision(piece)) {
        piece.x += offset;
        offset = -(offset < 0 ? offset - 1 : offset + 1);
        if (offset > piece.matrix[0].length) {
            piece.matrix = original;
            return;
        }
    }
}

function drawSquare(x, y, colorIndex, alpha = 1) {
    context.globalAlpha = alpha;
    context.fillStyle = COLORS[colorIndex] || '#1A1A2E';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = 'rgba(0,0,0,0.4)';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.globalAlpha = 1;
}

function drawGhost() {
    if (!piece) return;
    let ghost = { ...piece, matrix: piece.matrix };
    while (!isCollision({ ...ghost, y: ghost.y + 1 })) {
        ghost = { ...ghost, y: ghost.y + 1 };
    }
    ghost.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val > 0) {
                drawSquare(ghost.x + x, ghost.y + y, ghost.typeId, 0.2);
            }
        });
    });
}

function drawBoard() {
    context.fillStyle = '#1A1A2E';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    context.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            context.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                drawSquare(c, r, board[r][c]);
            }
        }
    }
}

function drawPiece() {
    if (!piece) return;
    piece.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val > 0) {
                drawSquare(piece.x + x, piece.y + y, piece.typeId);
            }
        });
    });
}

function showGameOver() {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.innerHTML = `
        <h2>GAME OVER</h2>
        <p>Score: ${score}</p>
        <button id="restart-button">RESTART</button>
    `;
    document.body.appendChild(overlay);
    document.getElementById('restart-button').addEventListener('click', () => {
        overlay.remove();
        startGame();
    });
}

function startGame() {
    initBoard();
    score = 0;
    level = 1;
    linesTotal = 0;
    nextPieceType = null;
    scoreEl.textContent = '0';
    levelEl.textContent = '1';
    linesEl.textContent = '0';
    gameRunning = true;
    spawnPiece();
}

document.addEventListener('keydown', event => {
    if (!gameRunning || !piece) return;
    switch (event.key) {
        case 'ArrowLeft':
            piece.x--;
            if (isCollision(piece)) piece.x++;
            break;
        case 'ArrowRight':
            piece.x++;
            if (isCollision(piece)) piece.x--;
            break;
        case 'ArrowDown':
            drop();
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            event.preventDefault();
            hardDrop();
            break;
    }
});

let lastTime = 0;
let dropCounter = 0;

function getDropInterval() {
    return Math.max(100, 1000 - (level - 1) * 80);
}

function gameLoop(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    if (gameRunning) {
        dropCounter += delta;
        if (dropCounter > getDropInterval()) {
            drop();
        }
    }

    drawBoard();
    if (piece) {
        drawGhost();
        drawPiece();
    }

    requestAnimationFrame(gameLoop);
}

startGame();
gameLoop();

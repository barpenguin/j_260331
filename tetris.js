
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
    [], // Empty
    [[1, 1, 1, 1]], // I
    [[2, 0, 0], [2, 2, 2]], // J
    [[0, 0, 3], [3, 3, 3]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0]], // S
    [[0, 6, 0], [6, 6, 6]], // T
    [[7, 7, 0], [0, 7, 7]]  // Z
];

let board = [];
let piece = null; // Start with no piece
let score = 0;
let gameOver = false;

// Initialize the game board
function initTetris() {
    for (let r = 0; r < ROWS; r++) {
        board.push(Array(COLS).fill(0));
    }
    // The first piece is spawned by getting the first question right.
    drawBoard();
}

// --- Drawing Functions ---
function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

function drawSquare(x, y, colorIndex) {
    context.fillStyle = COLORS[colorIndex] || '#1E1E1E';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#333';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawPiece() {
    if (!piece) return;
    context.fillStyle = COLORS[piece.typeId];
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                drawSquare(piece.x + x, piece.y + y, piece.typeId);
            }
        });
    });
}

// --- Game Logic ---

// This function is called from main.js as a reward
function spawnNewPiece() {
    if (gameOver) return;
    const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    const matrix = SHAPES[typeId];
    piece = {
        x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2),
        y: 0,
        matrix: matrix,
        typeId: typeId
    };

    if (isCollision()) {
        gameOver = true;
        alert('Game Over! Your score: ' + score);
        // Reset board
        board = [];
        initTetris();
        score = 0;
        gameOver = false;
        piece = null;
    }
}

function drop() {
    if (gameOver || !piece) return;

    piece.y++;
    if (isCollision()) {
        piece.y--;
        merge();
        clearLines();
        piece = null; // Stop the piece, wait for next reward
    }
}

function isCollision() {
    if (!piece) return false;
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (
                piece.matrix[y][x] !== 0 &&
                (
                    (board[piece.y + y] && board[piece.y + y][piece.x + x]) !== 0 ||
                     !board[piece.y + y] // Check for out of bounds vertically
                )
            ) {
                return true;
            }
        }
    }
    return false;
}

function merge() {
    if (!piece) return;
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if(board[piece.y + y]) {
                  board[piece.y + y][piece.x + x] = piece.typeId;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    outer: for (let r = ROWS - 1; r >= 0; r--) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 0) {
                continue outer;
            }
        }
        const row = board.splice(r, 1)[0].fill(0);
        board.unshift(row);
        r++; // Check the new row at the same index
        linesCleared++;
    }
    if (linesCleared > 0) {
        score += linesCleared * 10;
        // TODO: Update a score display element
    }
}

function rotate() {
    if (!piece) return;
    const result = [];
    for (let i = 0; i < piece.matrix[0].length; i++) {
        result.push([]);
    }

    for (let r = 0; r < piece.matrix.length; r++) {
        for (let c = 0; c < piece.matrix[r].length; c++) {
            result[c][piece.matrix.length - 1 - r] = piece.matrix[r][c];
        }
    }
    
    const originalMatrix = piece.matrix;
    piece.matrix = result;

    // Prevent rotating into other pieces or walls
    if (isCollision()) {
        piece.matrix = originalMatrix; // Revert rotation
    }
}

// --- User Input ---
document.addEventListener('keydown', event => {
    if (gameOver || !piece) return;

    if (event.key === 'ArrowLeft') {
        piece.x--;
        if (isCollision()) piece.x++;
    } else if (event.key === 'ArrowRight') {
        piece.x++;
        if (isCollision()) piece.x--;
    } else if (event.key === 'ArrowDown') {
        drop();
    } else if (event.key === 'ArrowUp') {
        rotate();
    }
});


// --- Game Loop ---
let lastTime = 0;
let dropCounter = 0;
const dropInterval = 1000; // Drop every second

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        drop();
        dropCounter = 0;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    if(piece) drawPiece();
    
    requestAnimationFrame(update);
}

// Kick off the game
update();

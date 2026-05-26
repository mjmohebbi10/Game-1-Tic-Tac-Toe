const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const modeSelect = document.getElementById("modeSelect");
const difficultySelect = document.getElementById("difficultySelect");
const difficultyWrapper = document.getElementById("difficultyWrapper");
const resetBtn = document.getElementById("resetBtn");

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

function initBoard() {
  boardEl.innerHTML = "";
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;

  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.dataset.index = String(i);
    btn.addEventListener("click", onCellClick);
    boardEl.appendChild(btn);
  }

  setStatus(`Player ${currentPlayer}'s turn`);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function onCellClick(event) {
  const index = Number(event.target.dataset.index);
  if (gameOver || board[index]) return;

  makeMove(index, currentPlayer);

  const result = evaluateBoard(board);
  if (result) return endGame(result);

  switchTurn();

  if (isSinglePlayerMode() && currentPlayer === "O" && !gameOver) {
    setTimeout(() => {
      const aiMove = getAIMove();
      makeMove(aiMove, "O");
      const aiResult = evaluateBoard(board);
      if (aiResult) return endGame(aiResult);
      switchTurn();
    }, 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  const btn = boardEl.querySelector(`[data-index="${index}"]`);
  btn.textContent = player;
  btn.disabled = true;
}

function switchTurn() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setStatus(`Player ${currentPlayer}'s turn`);
}

function evaluateBoard(state) {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { winner: state[a] };
    }
  }

  if (state.every(cell => cell)) {
    return { draw: true };
  }

  return null;
}

function endGame(result) {
  gameOver = true;
  if (result.winner) {
    setStatus(`Player ${result.winner} wins!`);
  } else {
    setStatus("It's a draw!");
  }
}

function isSinglePlayerMode() {
  return modeSelect.value === "single";
}

function getAIMove() {
  const difficulty = difficultySelect.value;

  if (difficulty === "easy") {
    return randomMove(board);
  }

  if (difficulty === "medium") {
    if (Math.random() < 0.5) return randomMove(board);
    return bestMoveMinimax(board, "O");
  }

  return bestMoveMinimax(board, "O");
}

function randomMove(state) {
  const available = state
    .map((cell, i) => (cell ? null : i))
    .filter(v => v !== null);
  return available[Math.floor(Math.random() * available.length)];
}

function bestMoveMinimax(state, aiPlayer) {
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (state[i]) continue;
    state[i] = aiPlayer;
    const score = minimax(state, 0, false, aiPlayer);
    state[i] = "";
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }

  return move;
}

function minimax(state, depth, isMaximizing, aiPlayer) {
  const humanPlayer = aiPlayer === "X" ? "O" : "X";
  const result = evaluateBoard(state);

  if (result?.winner === aiPlayer) return 10 - depth;
  if (result?.winner === humanPlayer) return depth - 10;
  if (result?.draw) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i]) continue;
      state[i] = aiPlayer;
      best = Math.max(best, minimax(state, depth + 1, false, aiPlayer));
      state[i] = "";
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (state[i]) continue;
    state[i] = humanPlayer;
    best = Math.min(best, minimax(state, depth + 1, true, aiPlayer));
    state[i] = "";
  }
  return best;
}

modeSelect.addEventListener("change", () => {
  difficultyWrapper.style.display = isSinglePlayerMode() ? "grid" : "none";
  initBoard();
});

difficultySelect.addEventListener("change", initBoard);
resetBtn.addEventListener("click", initBoard);

initBoard();

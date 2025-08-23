// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDECGtdP8MIAViYS5k1CCR781w80wGzhJ4",
  authDomain: "apaaja-9c982.firebaseapp.com",
  databaseURL: "https://apaaja-9c982-default-rtdb.firebaseio.com",
  projectId: "apaaja-9c982",
  storageBucket: "apaaja-9c982.appspot.com",
  messagingSenderId: "976797182264",
  appId: "1:976797182264:web:2a9d080b3cd289f4ad39cd",
  measurementId: "G-X6RMQ5W21Y"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================= WALL =================
const input = document.getElementById("inputText");
const charCount = document.getElementById("charCount");

input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length}/200`;
});

function shout() {
  if (!input.value.trim()) return;
  db.ref("posts").push({
    message: input.value,
    time: Date.now(),
    reactions: { fire: 0, laugh: 0, angry: 0 }
  });
  input.value = "";
  charCount.textContent = "0/200";
}

function reactToPost(id, type) {
  const postRef = db.ref("posts/" + id + "/reactions/" + type);
  postRef.transaction((current) => (current || 0) + 1);
}

const wall = document.getElementById("wall");
db.ref("posts").on("value", (snapshot) => {
  wall.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    const entries = Object.entries(data).sort((a, b) => b[1].time - a[1].time);
    entries.forEach(([id, p]) => {
      const post = document.createElement("div");
      post.className = "post";
      post.innerHTML = `
        <div class="message">${p.message}</div>
        <div class="meta">${new Date(p.time).toLocaleString()}</div>
        <div class="reactions">
          <button onclick="reactToPost('${id}', 'fire')">🔥 ${p.reactions?.fire || 0}</button>
          <button onclick="reactToPost('${id}', 'laugh')">😂 ${p.reactions?.laugh || 0}</button>
          <button onclick="reactToPost('${id}', 'angry')">😡 ${p.reactions?.angry || 0}</button>
        </div>
      `;
      wall.appendChild(post);
    });
  }
});

// ================= MODAL GAME =================
function toggleGame() {
  const modal = document.getElementById("gameModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
  document.getElementById("gameArea").innerHTML = "";
}

// ================= TIC TAC TOE =================
let tttBoard, tttCurrent, tttMode;

function chooseTicTacToe() {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `
    <h3>Pilih Mode Tic Tac Toe</h3>
    <button onclick="startTicTacToe('pvp')">👥 PvP</button>
    <button onclick="startTicTacToe('pvc')">🤖 PvC</button>
    <button onclick="startTicTacToe('cvc')">🤖 CvC</button>
  `;
}

function startTicTacToe(mode) {
  tttBoard = Array(9).fill(null);
  tttCurrent = "X";
  tttMode = mode;

  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `
    <h3>Tic Tac Toe (${mode.toUpperCase()})</h3>
    <div class="ttt-grid">
      ${Array(9).fill(0).map((_, i) => `<div class="ttt-cell" onclick="makeMove(${i})"></div>`).join("")}
    </div>
    <p id="tttStatus">Giliran: X</p>
    <button id="tttRestartBtn" style="display:none;" onclick="startTicTacToe('${mode}')">🔄 Restart</button>
  `;

  if (mode === "cvc") setTimeout(cvcMove, 500);
}

function makeMove(i) {
  if (tttBoard[i] || checkWinner() || (tttMode === "cvc")) return;

  tttBoard[i] = tttCurrent;
  document.getElementsByClassName("ttt-cell")[i].textContent = tttCurrent;

  if (checkWinner()) {
    document.getElementById("tttStatus").textContent = `🎉 ${tttCurrent} Menang!`;
    document.getElementById("tttRestartBtn").style.display = "inline-block";
    return;
  } else if (tttBoard.every(cell => cell)) {
    document.getElementById("tttStatus").textContent = "😮 Seri!";
    document.getElementById("tttRestartBtn").style.display = "inline-block";
    return;
  }

  tttCurrent = tttCurrent === "X" ? "O" : "X";
  document.getElementById("tttStatus").textContent = `Giliran: ${tttCurrent}`;

  if (tttMode === "pvc" && tttCurrent === "O") setTimeout(computerMove, 500);
}

function computerMove() {
  let bestScore = -Infinity, move;
  for (let i = 0; i < 9; i++) {
    if (!tttBoard[i]) {
      tttBoard[i] = "O";
      let score = minimax(tttBoard, 0, false);
      tttBoard[i] = null;
      if (score > bestScore) { bestScore = score; move = i; }
    }
  }
  makeMove(move);
}

function minimax(board, depth, isMax) {
  if (checkWinnerFor("O", board)) return 1;
  if (checkWinnerFor("X", board)) return -1;
  if (board.every(cell => cell)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function cvcMove() {
  if (checkWinner() || tttBoard.every(cell => cell)) {
    document.getElementById("tttRestartBtn").style.display = "inline-block";
    return;
  }

  let move;
  if (Math.random() < 0.5) {
    // random move
    const available = tttBoard.map((v,i)=>v?null:i).filter(v=>v!==null);
    move = available[Math.floor(Math.random()*available.length)];
  } else {
    // smart move
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!tttBoard[i]) {
        tttBoard[i] = tttCurrent;
        let score = minimax(tttBoard, 0, tttCurrent === "O");
        tttBoard[i] = null;
        if (score > bestScore) { bestScore = score; move = i; }
      }
    }
  }

  tttBoard[move] = tttCurrent;
  document.getElementsByClassName("ttt-cell")[move].textContent = tttCurrent;

  if (checkWinner()) {
    document.getElementById("tttStatus").textContent = `🤖 ${tttCurrent} Menang!`;
    document.getElementById("tttRestartBtn").style.display = "inline-block";
    return;
  } else if (tttBoard.every(cell => cell)) {
    document.getElementById("tttStatus").textContent = "😮 Seri!";
    document.getElementById("tttRestartBtn").style.display = "inline-block";
    return;
  }

  tttCurrent = tttCurrent === "X" ? "O" : "X";
  document.getElementById("tttStatus").textContent = `Giliran: ${tttCurrent}`;
  setTimeout(cvcMove, 500);
}

function checkWinner() { return checkWinnerFor(tttCurrent, tttBoard); }
function checkWinnerFor(player, board) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(([a,b,c]) => board[a]===player && board[b]===player && board[c]===player);
}

// ================= SNAKE =================
let snakeCanvas, ctx, snake, dx, dy, food, snakeInterval;

function startSnake() {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `
    <h3>Snake Nokia</h3>
    <canvas id="snakeCanvas" width="300" height="300"></canvas>
    <p id="snakeScore">Score: 0</p>
    <div class="snake-controls">
      <div class="snake-row"><button class="snake-btn" onclick="changeDirectionMobile('up')">⬆️</button></div>
      <div class="snake-row">
        <button class="snake-btn" onclick="changeDirectionMobile('left')">⬅️</button>
        <button class="snake-btn" onclick="changeDirectionMobile('down')">⬇️</button>
        <button class="snake-btn" onclick="changeDirectionMobile('right')">➡️</button>
      </div>
    </div>
  `;
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) restartBtn.remove();

  snakeCanvas = document.getElementById("snakeCanvas");
  ctx = snakeCanvas.getContext("2d");
  snake = [{x:150,y:150}]; dx=10; dy=0;
  food = spawnFood();
  document.getElementById("snakeScore").textContent = "Score: 0";

  clearInterval(snakeInterval);
  snakeInterval = setInterval(drawSnake, 100);
  document.onkeydown = changeDirection;
}

function drawSnake() {
  ctx.fillStyle="#f1f1f1"; ctx.fillRect(0,0,snakeCanvas.width,snakeCanvas.height);
  ctx.fillStyle="red"; ctx.fillRect(food.x,food.y,10,10);
  ctx.fillStyle="green"; snake.forEach(p=>ctx.fillRect(p.x,p.y,10,10));

  const head={x:snake[0].x+dx,y:snake[0].y+dy}; snake.unshift(head);
  if(head.x===food.x && head.y===food.y){food=spawnFood();document.getElementById("snakeScore").textContent="Score: "+(snake.length-1);} else snake.pop();

  if(head.x<0||head.y<0||head.x>=snakeCanvas.width||head.y>=snakeCanvas.height||snake.slice(1).some(p=>p.x===head.x&&p.y===head.y)){
    clearInterval(snakeInterval);
    ctx.fillStyle="rgba(0,0,0,0.7)"; ctx.fillRect(0,0,snakeCanvas.width,snakeCanvas.height);
    ctx.fillStyle="white"; ctx.font="bold 28px Poppins, sans-serif"; ctx.textAlign="center";
    ctx.fillText("GAME OVER",snakeCanvas.width/2,snakeCanvas.height/2-10);
    ctx.font="16px Poppins, sans-serif"; ctx.fillText("Score: "+(snake.length-1),snakeCanvas.width/2,snakeCanvas.height/2+20);
    const gameArea=document.getElementById("gameArea");
    if(!document.getElementById("restartBtn")){
      const btn=document.createElement("button");btn.id="restartBtn";btn.textContent="🔄 Restart";btn.onclick=startSnake;gameArea.appendChild(btn);
    }
  }
}

function changeDirection(e){if(e.key==="ArrowUp"&&dy===0){dx=0;dy=-10;}else if(e.key==="ArrowDown"&&dy===0){dx=0;dy=10;}else if(e.key==="ArrowLeft"&&dx===0){dx=-10;dy=0;}else if(e.key==="ArrowRight"&&dx===0){dx=10;dy=0;}}
function changeDirectionMobile(dir){if(dir==="up"&&dy===0){dx=0;dy=-10;}else if(dir==="down"&&dy===0){dx=0;dy=10;}else if(dir==="left"&&dx===0){dx=-10;dy=0;}else if(dir==="right"&&dx===0){dx=10;dy=0;}}
function spawnFood(){return{x:Math.floor(Math.random()*30)*10,y:Math.floor(Math.random()*30)*10};}

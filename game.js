const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelDisplay = document.getElementById("level");
const livesDisplay = document.getElementById("lives");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const actionButton = document.getElementById("actionButton");

const keys = {};

let gameRunning = true;
let currentLevel = 1;
let lives = 3;

const gravity = 0.7;
const groundY = 450;

const player = {
  x: 70,
  y: 380,
  width: 28,
  height: 60,

  velocityX: 0,
  velocityY: 0,

  speed: 4,
  jumpPower: -13,

  onGround: false
};

let buttonPressed = false;

const levels = [
  {
    spikes: [
      { x: 350, y: 430, width: 80, height: 20 }
    ],

    button: {
      x: 220,
      y: 415,
      width: 30,
      height: 35
    },

    exit: {
      x: 800,
      y: 370,
      width: 45,
      height: 80
    }
  },

  {
    spikes: [
      { x: 300, y: 430, width: 100, height: 20 },
      { x: 550, y: 430, width: 100, height: 20 }
    ],

    button: {
      x: 450,
      y: 415,
      width: 30,
      height: 35
    },

    exit: {
      x: 800,
      y: 370,
      width: 45,
      height: 80
    }
  },

  {
    spikes: [
      { x: 250, y: 430, width: 90, height: 20 },
      { x: 500, y: 430, width: 120, height: 20 }
    ],

    button: {
      x: 180,
      y: 415,
      width: 30,
      height: 35
    },

    exit: {
      x: 800,
      y: 370,
      width: 45,
      height: 80
    }
  }
];

function getLevel() {
  return levels[currentLevel - 1];
}

function resetPlayer() {
  player.x = 70;
  player.y = 380;
  player.velocityX = 0;
  player.velocityY = 0;
}

function resetLevel() {
  resetPlayer();
  buttonPressed = false;
  gameRunning = true;

  hideMessage();
  updateUI();
}

function updateUI() {
  levelDisplay.textContent = currentLevel;

  let hearts = "";

  for (let i = 0; i < lives; i++) {
    hearts += "❤️";
  }

  livesDisplay.textContent = hearts || "💀";
}

function showMessage(title, text, buttonText = "Restart") {
  messageTitle.textContent = title;
  messageText.textContent = text;
  actionButton.textContent = buttonText;

  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

function restartGame() {
  currentLevel = 1;
  lives = 3;

  resetLevel();
}

function loseLife() {
  lives--;

  updateUI();

  if (lives <= 0) {
    gameRunning = false;

    showMessage(
      "GAME OVER",
      "You ran out of lives!",
      "Restart Game"
    );

    return;
  }

  resetPlayer();
}

function nextLevel() {
  if (currentLevel < levels.length) {
    currentLevel++;

    resetLevel();
  } else {
    gameRunning = false;

    showMessage(
      "YOU WIN!",
      "You completed all levels!",
      "Play Again"
    );
  }
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function handleInput() {
  player.velocityX = 0;

  if (keys["ArrowLeft"] || keys["a"]) {
    player.velocityX = -player.speed;
  }

  if (keys["ArrowRight"] || keys["d"]) {
    player.velocityX = player.speed;
  }

  if (
    (keys["ArrowUp"] ||
      keys["w"] ||
      keys[" "]) &&
    player.onGround
  ) {
    player.velocityY = player.jumpPower;
    player.onGround = false;
  }
}

function updatePlayer() {
  handleInput();

  player.velocityY += gravity;

  player.x += player.velocityX;
  player.y += player.velocityY;

  // Screen boundaries
  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  // Ground collision
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.onGround = true;
  }
}

function updateButton() {
  const level = getLevel();

  if (isColliding(player, level.button)) {
    buttonPressed = true;
  }
}

function checkSpikes() {
  const level = getLevel();

  if (buttonPressed) {
    return;
  }

  for (const spike of level.spikes) {
    const hitbox = {
      x: spike.x,
      y: spike.y,
      width: spike.width,
      height: spike.height
    };

    if (isColliding(player, hitbox)) {
      loseLife();
      break;
    }
  }
}

function checkExit() {
  const level = getLevel();

  if (!buttonPressed) {
    return;
  }

  if (isColliding(player, level.exit)) {
    nextLevel();
  }
}

function update() {
  if (!gameRunning) {
    return;
  }

  updatePlayer();
  updateButton();
  checkSpikes();
  checkExit();
}

function drawBackground() {
  ctx.fillStyle = "#dbeafe";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background walls
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(0, 0, canvas.width, 25);

  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(0, 25, 20, 425);

  ctx.fillRect(canvas.width - 20, 25, 20, 425);
}

function drawGround() {
  ctx.fillStyle = "#374151";
  ctx.fillRect(0, groundY, canvas.width, 50);

  ctx.fillStyle = "#6b7280";

  for (let x = 0; x < canvas.width; x += 40) {
    ctx.fillRect(x, groundY, 2, 50);
  }
}

function drawPlayer() {
  const centerX = player.x + player.width / 2;

  ctx.strokeStyle = "#111827";
  ctx.fillStyle = "#111827";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  // Head
  ctx.beginPath();
  ctx.arc(centerX, player.y + 10, 9, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(centerX, player.y + 20);
  ctx.lineTo(centerX, player.y + 42);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(centerX, player.y + 25);
  ctx.lineTo(centerX - 15, player.y + 35);

  ctx.moveTo(centerX, player.y + 25);
  ctx.lineTo(centerX + 15, player.y + 35);

  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(centerX, player.y + 42);
  ctx.lineTo(centerX - 12, player.y + 58);

  ctx.moveTo(centerX, player.y + 42);
  ctx.lineTo(centerX + 12, player.y + 58);

  ctx.stroke();
}

function drawSpikes() {
  const level = getLevel();

  if (buttonPressed) {
    return;
  }

  ctx.fillStyle = "#dc2626";

  for (const spike of level.spikes) {
    const spikeCount = Math.floor(spike.width / 20);

    for (let i = 0; i < spikeCount; i++) {
      const x = spike.x + i * 20;

      ctx.beginPath();

      ctx.moveTo(x, spike.y + spike.height);
      ctx.lineTo(x + 10, spike.y);
      ctx.lineTo(x + 20, spike.y + spike.height);

      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawButton() {
  const level = getLevel();

  ctx.fillStyle = buttonPressed
    ? "#22c55e"
    : "#ef4444";

  ctx.fillRect(
    level.button.x,
    level.button.y,
    level.button.width,
    level.button.height
  );

  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Arial";

  ctx.fillText(
    buttonPressed ? "ON" : "OFF",
    level.button.x - 1,
    level.button.y - 8
  );
}

function drawExit() {
  const level = getLevel();

  ctx.fillStyle = buttonPressed
    ? "#22c55e"
    : "#64748b";

  ctx.fillRect(
    level.exit.x,
    level.exit.y,
    level.exit.width,
    level.exit.height
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Arial";

  ctx.fillText(
    buttonPressed ? "EXIT" : "LOCK",
    level.exit.x - 3,
    level.exit.y - 10
  );
}

function drawLevelText() {
  ctx.fillStyle = "#111827";
  ctx.font = "bold 22px Arial";

  ctx.fillText(
    `ROOM ${currentLevel}`,
    40,
    65
  );

  ctx.font = "16px Arial";

  if (!buttonPressed) {
    ctx.fillText(
      "Press the button to disable the spikes!",
      40,
      90
    );
  } else {
    ctx.fillText(
      "The exit is unlocked!",
      40,
      90
    );
  }
}

function draw() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawBackground();
  drawGround();
  drawLevelText();
  drawSpikes();
  drawButton();
  drawExit();
  drawPlayer();
}

function gameLoop() {
  update();
  draw();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;

  if (
    event.key === " " ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    event.preventDefault();
  }

  if (event.key.toLowerCase() === "r") {
    resetLevel();
  }
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

actionButton.addEventListener("click", () => {
  if (lives <= 0 || currentLevel >= levels.length) {
    restartGame();
  } else {
    resetLevel();
  }
});

updateUI();
gameLoop();
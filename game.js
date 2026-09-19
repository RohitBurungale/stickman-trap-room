<<<<<<< HEAD
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
=======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const actionButton = document.getElementById("actionButton");

const keys = {};

const gravity = 0.7;
const groundY = 450;

let gameRunning = true;
let currentLevel = 1;
let score = 0;
let lives = 3;

let levelData = null;
let levelStartTime = 0;
let timeLimit = 0;

let buttonPressed = 0;
let collectedKeys = 0;


// =====================================================
// PLAYER
// =====================================================

const player = {
    x: 60,
    y: 380,

    width: 28,
    height: 60,

    velocityX: 0,
    velocityY: 0,

    speed: 4,
    jumpPower: -13,

    onGround: false
};


// =====================================================
// DIFFICULTY
// =====================================================

function getDifficulty(level) {

    if (level <= 2) {
        return "Easy";
    }

    if (level <= 15) {
        return "Medium";
    }

    if (level <= 30) {
        return "Hard";
    }

    if (level <= 50) {
        return "Very Hard";
    }

    if (level <= 100) {
        return "Extreme";
    }

    return "Nightmare";
}


function getDifficultySettings(level) {

    const difficulty = getDifficulty(level);

    const settings = {

        Easy: {
            spikeCount: 1,
            buttonCount: 1,
            keyCount: 0,
            fireCount: 0,
            rockCount: 0,
            movingSpikeCount: 0,
            timer: 0,
            trapSpeed: 1
        },

        Medium: {
            spikeCount: 2,
            buttonCount: 1,
            keyCount: 1,
            fireCount: 1,
            rockCount: 0,
            movingSpikeCount: 1,
            timer: 0,
            trapSpeed: 1.4
        },

        Hard: {
            spikeCount: 3,
            buttonCount: 2,
            keyCount: 1,
            fireCount: 2,
            rockCount: 1,
            movingSpikeCount: 1,
            timer: 45,
            trapSpeed: 1.8
        },

        "Very Hard": {
            spikeCount: 4,
            buttonCount: 2,
            keyCount: 2,
            fireCount: 2,
            rockCount: 2,
            movingSpikeCount: 2,
            timer: 40,
            trapSpeed: 2.2
        },

        Extreme: {
            spikeCount: 5,
            buttonCount: 3,
            keyCount: 2,
            fireCount: 3,
            rockCount: 3,
            movingSpikeCount: 3,
            timer: 32,
            trapSpeed: 2.8
        },

        Nightmare: {
            spikeCount: 6,
            buttonCount: 3,
            keyCount: 3,
            fireCount: 4,
            rockCount: 4,
            movingSpikeCount: 4,
            timer: 25,
            trapSpeed: 3.5
        }

    };

    return settings[difficulty];
}


// =====================================================
// RANDOM
// =====================================================

function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function randomFloat(min, max) {

    return Math.random() * (max - min) + min;
}


// =====================================================
// COLLISION
// =====================================================

function isColliding(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}


// =====================================================
// SAFE RANDOM POSITION
// =====================================================

function safeX(existingObjects, min = 130, max = 760) {

    for (let attempt = 0; attempt < 50; attempt++) {

        const x = random(min, max);

        let safe = true;

        for (const obj of existingObjects) {

            if (
                Math.abs(x - obj.x) < 80
            ) {
                safe = false;
                break;
            }
        }

        if (safe) {
            return x;
        }
    }

    return random(min, max);
}


// =====================================================
// LEVEL GENERATOR
// =====================================================

function generateLevel(level) {

    const settings =
        getDifficultySettings(level);

    const data = {

        difficulty: getDifficulty(level),

        spikes: [],
        movingSpikes: [],
        fire: [],
        rocks: [],
        buttons: [],
        keys: [],
        coins: [],

        exit: {
            x: 815,
            y: 365,
            width: 45,
            height: 85
        }

    };


    const occupied = [];


    // -------------------------------------------------
    // BUTTONS
    // -------------------------------------------------

    for (
        let i = 0;
        i < settings.buttonCount;
        i++
    ) {

        const x =
            safeX(occupied, 130, 650);

        const button = {

            x: x,

            y: 415,

            width: 30,

            height: 35,

            pressed: false

        };

        data.buttons.push(button);

        occupied.push(button);
    }


    // -------------------------------------------------
    // SPIKES
    // -------------------------------------------------

    for (
        let i = 0;
        i < settings.spikeCount;
        i++
    ) {

        const x =
            safeX(occupied, 180, 760);

        const spike = {

            x: x,

            y: 430,

            width: random(40, 90),

            height: 20,

            active: true

        };

        data.spikes.push(spike);

        occupied.push(spike);
    }


    // -------------------------------------------------
    // MOVING SPIKES
    // -------------------------------------------------

    for (
        let i = 0;
        i < settings.movingSpikeCount;
        i++
    ) {

        const x =
            safeX(occupied, 250, 700);

        const movingSpike = {

            x: x,

            startX: x,

            minX: Math.max(80, x - 100),

            maxX: Math.min(760, x + 100),

            y: 360,

            width: 45,

            height: 25,

            direction:
                Math.random() > 0.5 ? 1 : -1,

            speed:
                settings.trapSpeed * randomFloat(0.7, 1.1)

        };

        data.movingSpikes.push(
            movingSpike
        );

        occupied.push(movingSpike);
    }


    // -------------------------------------------------
    // FIRE
    // -------------------------------------------------

    for (
        let i = 0;
        i < settings.fireCount;
        i++
    ) {

        const x =
            safeX(occupied, 220, 740);

        const fire = {

            x: x,

            y: 410,

            width: random(35, 65),

            height: 40,

            active: true

        };

        data.fire.push(fire);

        occupied.push(fire);
    }


    // -------------------------------------------------
    // FALLING ROCKS
    // -------------------------------------------------

    for (
        let i = 0;
        i < settings.rockCount;
        i++
    ) {

        const x =
            safeX(occupied, 180, 760);

        const rock = {

            x: x,

            y: -random(100, 500),

            width: 30,

            height: 30,

            velocityY:
                randomFloat(2, 4) *
                settings.trapSpeed,

            resetY:
                -random(100, 500)

        };

        data.rocks.push(rock);

        occupied.push(rock);
    }


    // -------------------------------------------------
    // KEYS
    // -------------------------------------------------

    for (
        let i = 0;
        i < settings.keyCount;
        i++
    ) {

        const key = {

            x:
                safeX(occupied, 150, 760),

            y:
                random(300, 390),

            width: 20,

            height: 20,

            collected: false

        };

        data.keys.push(key);

        occupied.push(key);
    }


    // -------------------------------------------------
    // COINS
    // -------------------------------------------------

    const coinCount =
        Math.min(
            12,
            3 + Math.floor(level / 5)
        );


    for (
        let i = 0;
        i < coinCount;
        i++
    ) {

        data.coins.push({

            x: random(80, 780),

            y: random(270, 395),

            radius: 8,

            collected: false

        });

    }


    // -------------------------------------------------
    // TIMER
    // -------------------------------------------------

    timeLimit =
        settings.timer;

    levelStartTime =
        performance.now();


    return data;
}


// =====================================================
// START LEVEL
// =====================================================

function startLevel() {

    levelData =
        generateLevel(currentLevel);

    resetPlayer();

    gameRunning = true;

    hideMessage();

    updateUI();
}


// =====================================================
// RESET PLAYER
// =====================================================

function resetPlayer() {

    player.x = 60;
    player.y = 380;

    player.velocityX = 0;
    player.velocityY = 0;

    player.onGround = false;
}


// =====================================================
// UI
// =====================================================

function updateUI() {

    levelDisplay.textContent =
        currentLevel;

    scoreDisplay.textContent =
        score;

    let hearts = "";

    for (
        let i = 0;
        i < lives;
        i++
    ) {

        hearts += "❤️";
    }

    livesDisplay.textContent =
        hearts || "💀";
}


// =====================================================
// INPUT
// =====================================================

function handleInput() {

    player.velocityX = 0;


    if (
        keys["ArrowLeft"] ||
        keys["a"]
    ) {

        player.velocityX =
            -player.speed;
    }


    if (
        keys["ArrowRight"] ||
        keys["d"]
    ) {

        player.velocityX =
            player.speed;
    }


    if (
        (
            keys["ArrowUp"] ||
            keys["w"] ||
            keys[" "]
        ) &&
        player.onGround
    ) {

        player.velocityY =
            player.jumpPower;

        player.onGround = false;
    }
}


// =====================================================
// PLAYER UPDATE
// =====================================================

function updatePlayer() {

    handleInput();

    player.velocityY += gravity;

    player.x += player.velocityX;

    player.y += player.velocityY;


    if (player.x < 20) {

        player.x = 20;
    }


    if (
        player.x + player.width >
        canvas.width - 20
    ) {

        player.x =
            canvas.width -
            20 -
            player.width;
    }


    if (
        player.y +
        player.height >=
        groundY
    ) {

        player.y =
            groundY -
            player.height;

        player.velocityY = 0;

        player.onGround = true;
    }
}


// =====================================================
// BUTTONS
// =====================================================

function updateButtons() {

    for (
        const button of levelData.buttons
    ) {

        if (
            !button.pressed &&
            isColliding(player, button)
        ) {

            button.pressed = true;

            buttonPressed++;
        }
    }
}


// =====================================================
// SPIKES
// =====================================================

function checkSpikes() {

    for (
        const spike of levelData.spikes
    ) {

        if (
            spike.active &&
            isColliding(player, spike)
        ) {

            loseLife();

            return true;
        }
    }

    return false;
}


// =====================================================
// MOVING SPIKES
// =====================================================

function updateMovingSpikes() {

    for (
        const spike of levelData.movingSpikes
    ) {

        spike.x +=
            spike.direction *
            spike.speed;


        if (
            spike.x <= spike.minX
        ) {

            spike.direction = 1;
        }


        if (
            spike.x >= spike.maxX
        ) {

            spike.direction = -1;
        }
    }
}


function checkMovingSpikes() {

    for (
        const spike of levelData.movingSpikes
    ) {

        if (
            isColliding(player, spike)
        ) {

            loseLife();

            return true;
        }
    }

    return false;
}


// =====================================================
// FIRE
// =====================================================

function checkFire() {

    for (
        const fire of levelData.fire
    ) {

        if (
            fire.active &&
            isColliding(player, fire)
        ) {

            loseLife();

            return true;
        }
    }

    return false;
}


// =====================================================
// ROCKS
// =====================================================

function updateRocks() {

    for (
        const rock of levelData.rocks
    ) {

        rock.y +=
            rock.velocityY;


        if (
            rock.y > canvas.height
        ) {

            rock.y =
                rock.resetY;

            rock.x =
                random(100, 780);
        }
    }
}


function checkRocks() {

    for (
        const rock of levelData.rocks
    ) {

        if (
            isColliding(player, rock)
        ) {

            loseLife();

            return true;
        }
    }

    return false;
}


// =====================================================
// KEYS
// =====================================================

function checkKeys() {

    for (
        const key of levelData.keys
    ) {

        if (key.collected) {
            continue;
        }


        if (
            isColliding(player, key)
        ) {

            key.collected = true;

            collectedKeys++;

            score += 25;

            updateUI();
        }
    }
}


// =====================================================
// COINS
// =====================================================

function checkCoins() {

    for (
        const coin of levelData.coins
    ) {

        if (coin.collected) {
            continue;
        }


        const dx =
            player.x +
            player.width / 2 -
            coin.x;

        const dy =
            player.y +
            player.height / 2 -
            coin.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance < 25) {

            coin.collected = true;

            score += 10;

            updateUI();
        }
    }
}


// =====================================================
// EXIT
// =====================================================

function exitUnlocked() {

    const allButtons =
        buttonPressed >=
        levelData.buttons.length;


    const allKeys =
        collectedKeys >=
        levelData.keys.length;


    return allButtons && allKeys;
}


function checkExit() {

    if (!exitUnlocked()) {
        return;
    }


    if (
        isColliding(
            player,
            levelData.exit
        )
    ) {

        completeLevel();
    }
}


// =====================================================
// TIMER
// =====================================================

function checkTimer(now) {

    if (timeLimit <= 0) {
        return;
    }


    const elapsed =
        (now - levelStartTime) / 1000;


    if (elapsed >= timeLimit) {

        loseLife();
    }
}


// =====================================================
// LOSE LIFE
// =====================================================

function loseLife() {

    if (!gameRunning) {
        return;
    }


    lives--;

    updateUI();


    if (lives <= 0) {

        gameRunning = false;


        showMessage(
            "GAME OVER",
            `You reached Level ${currentLevel}. Score: ${score}`,
            "Play Again"
        );

        return;
    }


    // Reset current room

    levelData =
        generateLevel(currentLevel);

    resetPlayer();
}


// =====================================================
// COMPLETE LEVEL
// =====================================================

function completeLevel() {

    score +=
        currentLevel * 100;


    currentLevel++;


    collectedKeys = 0;


    // Every level gets harder

    levelData =
        generateLevel(currentLevel);


    resetPlayer();

    updateUI();
}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    title,
    text,
    buttonText
) {

    messageTitle.textContent =
        title;

    messageText.textContent =
        text;

    actionButton.textContent =
        buttonText;

    message.classList.remove(
        "hidden"
    );
}


function hideMessage() {

    message.classList.add(
        "hidden"
    );
}


// =====================================================
// DRAW BACKGROUND
// =====================================================

function drawBackground() {

    ctx.fillStyle =
        "#dbeafe";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "#cbd5e1";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        25
    );


    ctx.fillStyle =
        "#94a3b8";

    ctx.fillRect(
        0,
        25,
        20,
        425
    );

    ctx.fillRect(
        canvas.width - 20,
        25,
        20,
        425
    );
}


// =====================================================
// GROUND
// =====================================================

function drawGround() {

    ctx.fillStyle =
        "#374151";

    ctx.fillRect(
        0,
        groundY,
        canvas.width,
        50
    );


    ctx.fillStyle =
        "#6b7280";


    for (
        let x = 0;
        x < canvas.width;
        x += 40
    ) {

        ctx.fillRect(
            x,
            groundY,
            2,
            50
        );
    }
}


// =====================================================
// PLAYER
// =====================================================

function drawPlayer() {

    const centerX =
        player.x +
        player.width / 2;


    ctx.strokeStyle =
        "#111827";

    ctx.fillStyle =
        "#111827";

    ctx.lineWidth = 5;

    ctx.lineCap =
        "round";


    // Head

    ctx.beginPath();

    ctx.arc(
        centerX,
        player.y + 10,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        player.y + 20
    );

    ctx.lineTo(
        centerX,
        player.y + 42
    );

    ctx.stroke();


    // Arms

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        player.y + 25
    );

    ctx.lineTo(
        centerX - 15,
        player.y + 35
    );


    ctx.moveTo(
        centerX,
        player.y + 25
    );

    ctx.lineTo(
        centerX + 15,
        player.y + 35
    );

    ctx.stroke();


    // Legs

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        player.y + 42
    );

    ctx.lineTo(
        centerX - 12,
        player.y + 58
    );


    ctx.moveTo(
        centerX,
        player.y + 42
    );

    ctx.lineTo(
        centerX + 12,
        player.y + 58
    );

    ctx.stroke();
}


// =====================================================
// SPIKES DRAW
// =====================================================

function drawSpikes() {

    ctx.fillStyle =
        "#dc2626";


    for (
        const spike of levelData.spikes
    ) {

        if (!spike.active) {
            continue;
        }


        const count =
            Math.floor(
                spike.width / 20
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const x =
                spike.x +
                i * 20;


            ctx.beginPath();

            ctx.moveTo(
                x,
                spike.y + spike.height
            );

            ctx.lineTo(
                x + 10,
                spike.y
            );

            ctx.lineTo(
                x + 20,
                spike.y + spike.height
            );

            ctx.closePath();

            ctx.fill();
        }
    }
}


// =====================================================
// MOVING SPIKES DRAW
// =====================================================

function drawMovingSpikes() {

    ctx.fillStyle =
        "#991b1b";


    for (
        const spike of levelData.movingSpikes
    ) {

        ctx.beginPath();

        ctx.moveTo(
            spike.x,
            spike.y + spike.height
        );

        ctx.lineTo(
            spike.x + spike.width / 2,
            spike.y
        );

        ctx.lineTo(
            spike.x + spike.width,
            spike.y + spike.height
        );

        ctx.closePath();

        ctx.fill();
    }
}


// =====================================================
// FIRE DRAW
// =====================================================

function drawFire() {

    for (
        const fire of levelData.fire
    ) {

        ctx.fillStyle =
            "#f97316";

        ctx.fillRect(
            fire.x,
            fire.y,
            fire.width,
            fire.height
        );


        ctx.fillStyle =
            "#facc15";

        ctx.fillRect(
            fire.x + 8,
            fire.y + 8,
            fire.width - 16,
            fire.height - 8
        );
    }
}


// =====================================================
// ROCK DRAW
// =====================================================

function drawRocks() {

    ctx.fillStyle =
        "#4b5563";


    for (
        const rock of levelData.rocks
    ) {

        ctx.beginPath();

        ctx.arc(
            rock.x + 15,
            rock.y + 15,
            15,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// =====================================================
// BUTTON DRAW
// =====================================================

function drawButtons() {

    for (
        const button of levelData.buttons
    ) {

        ctx.fillStyle =
            button.pressed
                ? "#22c55e"
                : "#ef4444";


        ctx.fillRect(
            button.x,
            button.y,
            button.width,
            button.height
        );
    }
}


// =====================================================
// KEY DRAW
// =====================================================

function drawKeys() {

    for (
        const key of levelData.keys
    ) {

        if (key.collected) {
            continue;
        }


        ctx.fillStyle =
            "#facc15";


        ctx.beginPath();

        ctx.arc(
            key.x + 7,
            key.y + 10,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillRect(
            key.x + 12,
            key.y + 8,
            12,
            4
        );
    }
}


// =====================================================
// COINS DRAW
// =====================================================

function drawCoins() {

    for (
        const coin of levelData.coins
    ) {

        if (coin.collected) {
            continue;
        }


        ctx.beginPath();

        ctx.arc(
            coin.x,
            coin.y,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#facc15";

        ctx.fill();


        ctx.strokeStyle =
            "#ca8a04";

        ctx.stroke();
    }
}


// =====================================================
// EXIT DRAW
// =====================================================

function drawExit() {

    const unlocked =
        exitUnlocked();


    ctx.fillStyle =
        unlocked
            ? "#22c55e"
            : "#64748b";


    ctx.fillRect(
        levelData.exit.x,
        levelData.exit.y,
        levelData.exit.width,
        levelData.exit.height
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 11px Arial";


    ctx.fillText(
        unlocked ? "EXIT" : "LOCKED",
        levelData.exit.x - 5,
        levelData.exit.y - 10
    );
}


// =====================================================
// LEVEL INFO
// =====================================================

function drawLevelInfo(now) {

    ctx.fillStyle =
        "#111827";

    ctx.font =
        "bold 20px Arial";


    ctx.fillText(
        `ROOM ${currentLevel}`,
        40,
        60
    );


    ctx.font =
        "bold 15px Arial";


    ctx.fillText(
        `Difficulty: ${levelData.difficulty}`,
        40,
        85
    );


    let objective;


    if (!exitUnlocked()) {

        objective =
            `Buttons: ${buttonPressed}/${levelData.buttons.length} | Keys: ${collectedKeys}/${levelData.keys.length}`;

    } else {

        objective =
            "EXIT UNLOCKED - RUN!";

    }


    ctx.font =
        "14px Arial";


    ctx.fillText(
        objective,
        40,
        108
    );


    // Timer

    if (timeLimit > 0) {

        const elapsed =
            (now - levelStartTime) / 1000;

        const remaining =
            Math.max(
                0,
                Math.ceil(
                    timeLimit - elapsed
                )
            );


        ctx.fillStyle =
            remaining <= 8
                ? "#dc2626"
                : "#111827";


        ctx.font =
            "bold 18px Arial";


        ctx.fillText(
            `TIME: ${remaining}s`,
            700,
            55
        );
    }
}


// =====================================================
// DRAW
// =====================================================

function draw(now) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawBackground();

    drawGround();

    drawLevelInfo(now);

    drawSpikes();

    drawMovingSpikes();

    drawFire();

    drawRocks();

    drawKeys();

    drawCoins();

    drawButtons();

    drawExit();

    drawPlayer();
}


// =====================================================
// UPDATE
// =====================================================

function update(now) {

    if (!gameRunning) {
        return;
    }


    updatePlayer();

    updateButtons();

    updateMovingSpikes();

    updateRocks();


    // Collision checks

    if (checkSpikes()) {
        return;
    }


    if (checkMovingSpikes()) {
        return;
    }


    if (checkFire()) {
        return;
    }


    if (checkRocks()) {
        return;
    }


    checkKeys();

    checkCoins();

    checkExit();

    checkTimer(now);
}


// =====================================================
// GAME LOOP
// =====================================================

function gameLoop(now) {

    update(now);

    draw(now);

    requestAnimationFrame(
        gameLoop
    );
}


// =====================================================
// KEYBOARD
// =====================================================

document.addEventListener(
    "keydown",
    (event) => {

        keys[event.key] = true;


        if (
            event.key === " " ||
            event.key.startsWith("Arrow")
        ) {

            event.preventDefault();
        }


        if (
            event.key.toLowerCase() === "r"
        ) {

            startLevel();
        }
    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key] = false;
    }
);


// =====================================================
// MOBILE CONTROLS
// =====================================================

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const jumpBtn =
    document.getElementById("jumpBtn");


function holdButton(
    button,
    key
) {

    button.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            keys[key] = true;
        }
    );


    button.addEventListener(
        "pointerup",
        () => {

            keys[key] = false;
        }
    );


    button.addEventListener(
        "pointercancel",
        () => {

            keys[key] = false;
        }
    );


    button.addEventListener(
        "pointerleave",
        () => {

            keys[key] = false;
        }
    );
}


holdButton(
    leftBtn,
    "ArrowLeft"
);


holdButton(
    rightBtn,
    "ArrowRight"
);


jumpBtn.addEventListener(
    "pointerdown",
    (event) => {

        event.preventDefault();

        keys[" "] = true;

        setTimeout(() => {

            keys[" "] = false;

        }, 120);
    }
);


// =====================================================
// RESTART
// =====================================================

actionButton.addEventListener(
    "click",
    () => {

        currentLevel = 1;

        score = 0;

        lives = 3;

        collectedKeys = 0;

        startLevel();
    }
);


// =====================================================
// START
// =====================================================

startLevel();

requestAnimationFrame(
    gameLoop
);
>>>>>>> 873b6dc (Initial Stickman Trap Room game)

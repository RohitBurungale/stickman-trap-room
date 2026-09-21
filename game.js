/* =========================================================
   STICKMAN TRAP ROOM
   Updated Game Engine
========================================================= */

"use strict";


/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/* =========================================================
   UI ELEMENTS
========================================================= */

const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

const message = document.getElementById("message");
const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const messageStars = document.getElementById("messageStars");
const actionButton = document.getElementById("actionButton");

const pauseOverlay = document.getElementById("pauseOverlay");
const resumeButton = document.getElementById("resumeButton");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");


/* =========================================================
   GAME STATE
========================================================= */

const keys = {};

let gameRunning = true;
let paused = false;

let currentLevel = 1;
let score = 0;
let lives = 3;

let levelData = null;

let levelStartTime = 0;
let timeLimit = 0;

let buttonPressed = 0;
let collectedKeys = 0;

let levelDamaged = false;

let lastTime = 0;

let damageCooldown = 0;

let screenShake = 0;

let levelTransition = 0;


/* =========================================================
   WORLD
========================================================= */

const WORLD = {
    width: 900,
    height: 500,
    groundY: 450,

    leftWall: 20,
    rightWall: 880
};


/* =========================================================
   PHYSICS
========================================================= */

const PHYSICS = {

    gravity: 1800,

    moveSpeed: 280,

    acceleration: 1800,

    friction: 2200,

    jumpPower: 650,

    maxFallSpeed: 900,

    coyoteTime: 0.12,

    jumpBufferTime: 0.12

};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 60,
    y: 390,

    width: 28,
    height: 60,

    velocityX: 0,
    velocityY: 0,

    onGround: false,

    facing: 1,

    coyoteTimer: 0,

    jumpBufferTimer: 0,

    invincible: 0,

    animationTime: 0,

    state: "idle"
};


/* =========================================================
   DIFFICULTY
========================================================= */

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


/* =========================================================
   RANDOM
========================================================= */

function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function randomFloat(min, max) {

    return Math.random() * (max - min) + min;
}


/* =========================================================
   COLLISION
========================================================= */

function isColliding(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}


/* =========================================================
   PLAYER HITBOX
========================================================= */

function getPlayerHitbox() {

    return {

        x: player.x + 5,

        y: player.y + 5,

        width: player.width - 10,

        height: player.height - 5

    };
}


function collidesWithPlayer(object) {

    return isColliding(
        getPlayerHitbox(),
        object
    );
}


/* =========================================================
   SAFE POSITION
========================================================= */

function safeX(existingObjects, min = 130, max = 760) {

    for (let attempt = 0; attempt < 60; attempt++) {

        const x = random(min, max);

        let safe = true;

        for (const obj of existingObjects) {

            if (
                Math.abs(x - obj.x) < 85
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


/* =========================================================
   LEVEL GENERATION
========================================================= */

function generateLevel(level) {

    const settings =
        getDifficultySettings(level);

    const data = {

        difficulty:
            getDifficulty(level),

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


    /* BUTTONS */

    for (
        let i = 0;
        i < settings.buttonCount;
        i++
    ) {

        const x =
            safeX(
                occupied,
                150,
                650
            );

        const button = {

            x,

            y: 415,

            width: 30,

            height: 35,

            pressed: false,

            pulse: 0

        };

        data.buttons.push(button);

        occupied.push(button);
    }


    /* SPIKES */

    for (
        let i = 0;
        i < settings.spikeCount;
        i++
    ) {

        const x =
            safeX(
                occupied,
                180,
                760
            );

        const spike = {

            x,

            y: 430,

            width: random(40, 90),

            height: 20,

            active: true,

            animation: randomFloat(0, Math.PI * 2)

        };

        data.spikes.push(spike);

        occupied.push(spike);
    }


    /* MOVING SPIKES */

    for (
        let i = 0;
        i < settings.movingSpikeCount;
        i++
    ) {

        const x =
            safeX(
                occupied,
                250,
                700
            );

        const movingSpike = {

            x,

            startX: x,

            minX: Math.max(
                80,
                x - 100
            ),

            maxX: Math.min(
                760,
                x + 100
            ),

            y: 360,

            width: 45,

            height: 25,

            direction:
                Math.random() > 0.5
                    ? 1
                    : -1,

            speed:
                settings.trapSpeed *
                randomFloat(70, 110),

            rotation: 0

        };

        data.movingSpikes.push(
            movingSpike
        );

        occupied.push(
            movingSpike
        );
    }


    /* FIRE */

    for (
        let i = 0;
        i < settings.fireCount;
        i++
    ) {

        const x =
            safeX(
                occupied,
                220,
                740
            );

        const fire = {

            x,

            y: 410,

            width: random(35, 65),

            height: 40,

            active: true,

            animation:
                randomFloat(0, Math.PI * 2)

        };

        data.fire.push(fire);

        occupied.push(fire);
    }


    /* ROCKS */

    for (
        let i = 0;
        i < settings.rockCount;
        i++
    ) {

        const x =
            safeX(
                occupied,
                180,
                760
            );

        const rock = {

            x,

            y: -random(100, 500),

            width: 30,

            height: 30,

            velocityY:
                randomFloat(120, 220) *
                settings.trapSpeed,

            rotation:
                randomFloat(0, Math.PI * 2),

            rotationSpeed:
                randomFloat(-3, 3),

            resetY:
                -random(100, 500)

        };

        data.rocks.push(rock);

        occupied.push(rock);
    }


    /* KEYS */

    for (
        let i = 0;
        i < settings.keyCount;
        i++
    ) {

        const key = {

            x:
                safeX(
                    occupied,
                    150,
                    760
                ),

            y:
                random(300, 390),

            width: 20,

            height: 20,

            collected: false,

            animation:
                randomFloat(0, Math.PI * 2)

        };

        data.keys.push(key);

        occupied.push(key);
    }


    /* COINS */

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

            collected: false,

            animation:
                randomFloat(0, Math.PI * 2)

        });

    }


    timeLimit =
        settings.timer;

    levelStartTime =
        performance.now();


    return data;
}


/* =========================================================
   START LEVEL
========================================================= */

function startLevel() {

    levelData =
        generateLevel(
            currentLevel
        );

    resetPlayer();

    buttonPressed = 0;

    collectedKeys = 0;

    levelDamaged = false;

    damageCooldown = 0;

    paused = false;

    gameRunning = true;

    levelTransition = 0;

    hideMessage();

    hidePause();

    updateUI();
}


/* =========================================================
   RESET PLAYER
========================================================= */

function resetPlayer() {

    player.x = 60;

    player.y =
        WORLD.groundY -
        player.height;

    player.velocityX = 0;

    player.velocityY = 0;

    player.onGround = true;

    player.coyoteTimer =
        PHYSICS.coyoteTime;

    player.jumpBufferTimer = 0;

    player.invincible = 0;

    player.state = "idle";
}


/* =========================================================
   UI
========================================================= */

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


/* =========================================================
   INPUT
========================================================= */

function requestJump() {

    player.jumpBufferTimer =
        PHYSICS.jumpBufferTime;
}


function handleInput(dt) {

    const movingLeft =
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"];

    const movingRight =
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"];


    if (movingLeft) {

        player.velocityX -=
            PHYSICS.acceleration * dt;

        player.facing = -1;

    } else if (movingRight) {

        player.velocityX +=
            PHYSICS.acceleration * dt;

        player.facing = 1;

    } else {

        if (player.velocityX > 0) {

            player.velocityX = Math.max(
                0,
                player.velocityX -
                PHYSICS.friction * dt
            );

        } else if (player.velocityX < 0) {

            player.velocityX = Math.min(
                0,
                player.velocityX +
                PHYSICS.friction * dt
            );
        }
    }


    player.velocityX =
        Math.max(
            -PHYSICS.moveSpeed,
            Math.min(
                PHYSICS.moveSpeed,
                player.velocityX
            )
        );


    if (
        keys["ArrowUp"] ||
        keys["w"] ||
        keys["W"] ||
        keys[" "]
    ) {

        requestJump();

        keys["ArrowUp"] = false;
        keys["w"] = false;
        keys["W"] = false;
        keys[" "] = false;
    }


    if (player.jumpBufferTimer > 0) {

        player.jumpBufferTimer -= dt;
    }


    if (
        player.jumpBufferTimer > 0 &&
        (
            player.onGround ||
            player.coyoteTimer > 0
        )
    ) {

        player.velocityY =
            -PHYSICS.jumpPower;

        player.onGround = false;

        player.coyoteTimer = 0;

        player.jumpBufferTimer = 0;
    }
}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(dt) {

    handleInput(dt);


    if (!player.onGround) {

        player.velocityY +=
            PHYSICS.gravity * dt;

        player.velocityY =
            Math.min(
                player.velocityY,
                PHYSICS.maxFallSpeed
            );

        player.coyoteTimer =
            Math.max(
                0,
                player.coyoteTimer - dt
            );

    } else {

        player.coyoteTimer =
            PHYSICS.coyoteTime;

        player.velocityY = 0;
    }


    player.x +=
        player.velocityX * dt;

    player.y +=
        player.velocityY * dt;


    /* Walls */

    if (player.x < WORLD.leftWall) {

        player.x =
            WORLD.leftWall;
    }


    if (
        player.x + player.width >
        WORLD.rightWall
    ) {

        player.x =
            WORLD.rightWall -
            player.width;
    }


    /* Ground */

    if (
        player.y +
        player.height >=
        WORLD.groundY
    ) {

        player.y =
            WORLD.groundY -
            player.height;

        player.velocityY = 0;

        player.onGround = true;

    } else {

        player.onGround = false;
    }


    /* Animation */

    player.animationTime += dt;


    if (!player.onGround) {

        player.state =
            player.velocityY < 0
                ? "jump"
                : "fall";

    } else if (
        Math.abs(player.velocityX) > 30
    ) {

        player.state = "run";

    } else {

        player.state = "idle";
    }
}


/* =========================================================
   BUTTONS
========================================================= */

function updateButtons(dt) {

    for (
        const button of levelData.buttons
    ) {

        button.pulse += dt;

        if (
            !button.pressed &&
            collidesWithPlayer(button)
        ) {

            button.pressed = true;

            buttonPressed++;

            createParticles(
                button.x + button.width / 2,
                button.y,
                12,
                "#22c55e"
            );
        }
    }
}


/* =========================================================
   MOVING SPIKES
========================================================= */

function updateMovingSpikes(dt) {

    for (
        const spike of levelData.movingSpikes
    ) {

        spike.x +=
            spike.direction *
            spike.speed *
            dt;

        spike.rotation +=
            dt * 2;


        if (
            spike.x <= spike.minX
        ) {

            spike.x =
                spike.minX;

            spike.direction = 1;
        }


        if (
            spike.x >= spike.maxX
        ) {

            spike.x =
                spike.maxX;

            spike.direction = -1;
        }
    }
}


/* =========================================================
   ROCKS
========================================================= */

function updateRocks(dt) {

    for (
        const rock of levelData.rocks
    ) {

        rock.y +=
            rock.velocityY * dt;

        rock.rotation +=
            rock.rotationSpeed * dt;


        if (
            rock.y >
            canvas.height
        ) {

            rock.y =
                rock.resetY;

            rock.x =
                random(
                    100,
                    780
                );
        }
    }
}


/* =========================================================
   FIRE ANIMATION
========================================================= */

function updateFire(dt) {

    for (
        const fire of levelData.fire
    ) {

        fire.animation +=
            dt * 8;
    }
}


/* =========================================================
   KEYS
========================================================= */

function checkKeys() {

    for (
        const key of levelData.keys
    ) {

        if (key.collected) {
            continue;
        }


        key.animation +=
            0.08;


        if (
            collidesWithPlayer(key)
        ) {

            key.collected = true;

            collectedKeys++;

            score += 25;

            createParticles(
                key.x,
                key.y,
                15,
                "#facc15"
            );

            updateUI();
        }
    }
}


/* =========================================================
   COINS
========================================================= */

function checkCoins() {

    for (
        const coin of levelData.coins
    ) {

        if (coin.collected) {
            continue;
        }


        coin.animation +=
            0.08;


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

            createParticles(
                coin.x,
                coin.y,
                10,
                "#facc15"
            );

            updateUI();
        }
    }
}


/* =========================================================
   TRAP COLLISIONS
========================================================= */

function checkTraps() {

    if (player.invincible > 0) {
        return false;
    }


    for (
        const spike of levelData.spikes
    ) {

        if (
            spike.active &&
            collidesWithPlayer(spike)
        ) {

            loseLife();

            return true;
        }
    }


    for (
        const spike of levelData.movingSpikes
    ) {

        if (
            collidesWithPlayer(spike)
        ) {

            loseLife();

            return true;
        }
    }


    for (
        const fire of levelData.fire
    ) {

        if (
            fire.active &&
            collidesWithPlayer(fire)
        ) {

            loseLife();

            return true;
        }
    }


    for (
        const rock of levelData.rocks
    ) {

        if (
            collidesWithPlayer(rock)
        ) {

            loseLife();

            return true;
        }
    }


    return false;
}


/* =========================================================
   EXIT
========================================================= */

function exitUnlocked() {

    const allButtons =
        buttonPressed >=
        levelData.buttons.length;

    const allKeys =
        collectedKeys >=
        levelData.keys.length;


    return (
        allButtons &&
        allKeys
    );
}


function checkExit() {

    if (!exitUnlocked()) {
        return;
    }


    if (
        collidesWithPlayer(
            levelData.exit
        )
    ) {

        completeLevel();
    }
}


/* =========================================================
   TIMER
========================================================= */

function checkTimer(now) {

    if (
        timeLimit <= 0
    ) {
        return;
    }


    const elapsed =
        (now - levelStartTime) /
        1000;


    if (
        elapsed >=
        timeLimit
    ) {

        loseLife();
    }
}


/* =========================================================
   DAMAGE
========================================================= */

function loseLife() {

    if (
        !gameRunning ||
        paused ||
        player.invincible > 0
    ) {
        return;
    }


    lives--;

    levelDamaged = true;

    player.invincible = 1.2;

    screenShake = 14;


    createParticles(
        player.x +
        player.width / 2,

        player.y +
        player.height / 2,

        20,

        "#ef4444"
    );


    updateUI();


    if (lives <= 0) {

        gameRunning = false;

        showMessage(
            "GAME OVER",
            `You reached Level ${currentLevel}. Score: ${score}`,
            "Play Again",
            "💀",
            "☆☆☆"
        );

        return;
    }


    setTimeout(() => {

        if (!gameRunning) {
            return;
        }

        levelData =
            generateLevel(
                currentLevel
            );

        buttonPressed = 0;

        collectedKeys = 0;

        resetPlayer();

    }, 150);
}


/* =========================================================
   LEVEL COMPLETE
========================================================= */

function calculateStars() {

    let stars = 3;


    if (levelDamaged) {
        stars--;
    }


    if (
        timeLimit > 0
    ) {

        const elapsed =
            (performance.now() -
                levelStartTime) /
            1000;

        const remaining =
            timeLimit -
            elapsed;


        if (
            remaining <
            timeLimit * 0.2
        ) {

            stars--;
        }
    }


    return Math.max(
        1,
        stars
    );
}


function completeLevel() {

    if (!gameRunning) {
        return;
    }


    gameRunning = false;


    const stars =
        calculateStars();


    const levelBonus =
        currentLevel * 100;


    const coinBonus =
        levelData.coins.filter(
            coin => coin.collected
        ).length * 10;


    const starBonus =
        stars * 50;


    score +=
        levelBonus +
        coinBonus +
        starBonus;


    const starText =
        "★".repeat(stars) +
        "☆".repeat(
            3 - stars
        );


    showMessage(
        "LEVEL COMPLETE!",
        `Level ${currentLevel} cleared! Bonus: +${levelBonus + coinBonus + starBonus}`,
        "Next Level",
        "🏆",
        starText
    );
}


/* =========================================================
   NEXT LEVEL
========================================================= */

function nextLevel() {

    currentLevel++;

    buttonPressed = 0;

    collectedKeys = 0;

    levelDamaged = false;

    startLevel();
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    title,
    text,
    buttonText,
    icon = "⚠️",
    stars = "☆☆☆"
) {

    messageIcon.textContent =
        icon;

    messageTitle.textContent =
        title;

    messageText.textContent =
        text;

    messageStars.textContent =
        stars;

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


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        !gameRunning
    ) {
        return;
    }


    paused =
        !paused;


    if (paused) {

        pauseOverlay.classList.remove(
            "hidden"
        );

    } else {

        hidePause();

        lastTime =
            performance.now();
    }
}


function hidePause() {

    pauseOverlay.classList.add(
        "hidden"
    );
}


resumeButton.addEventListener(
    "click",
    () => {

        if (paused) {
            togglePause();
        }

    }
);


/* =========================================================
   PARTICLES
========================================================= */

const particles = [];


function createParticles(
    x,
    y,
    count,
    color
) {

    for (
        let i = 0;
        i < count;
        i++
    ) {

        particles.push({

            x,

            y,

            velocityX:
                randomFloat(
                    -160,
                    160
                ),

            velocityY:
                randomFloat(
                    -220,
                    -50
                ),

            life: 1,

            size:
                randomFloat(
                    2,
                    5
                ),

            color
        });
    }
}


function updateParticles(dt) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.velocityX *
            dt;

        particle.y +=
            particle.velocityY *
            dt;


        particle.velocityY +=
            500 * dt;


        particle.life -=
            dt * 1.5;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.save();

        ctx.globalAlpha =
            Math.max(
                0,
                particle.life
            );

        ctx.fillStyle =
            particle.color;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );


    gradient.addColorStop(
        0,
        "#dbeafe"
    );

    gradient.addColorStop(
        1,
        "#bfdbfe"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Top wall */

    ctx.fillStyle =
        "#cbd5e1";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        25
    );


    /* Side walls */

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


    /* Background panels */

    ctx.strokeStyle =
        "rgba(100,116,139,0.15)";

    ctx.lineWidth = 1;


    for (
        let x = 20;
        x < canvas.width - 20;
        x += 60
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            25
        );

        ctx.lineTo(
            x,
            450
        );

        ctx.stroke();
    }


    for (
        let y = 80;
        y < 450;
        y += 60
    ) {

        ctx.beginPath();

        ctx.moveTo(
            20,
            y
        );

        ctx.lineTo(
            880,
            y
        );

        ctx.stroke();
    }
}


/* =========================================================
   GROUND
========================================================= */

function drawGround() {

    ctx.fillStyle =
        "#374151";

    ctx.fillRect(
        0,
        WORLD.groundY,
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
            WORLD.groundY,
            2,
            50
        );
    }


    ctx.fillStyle =
        "#111827";

    ctx.fillRect(
        0,
        WORLD.groundY,
        canvas.width,
        5
    );
}


/* =========================================================
   PLAYER DRAW
========================================================= */

function drawPlayer() {

    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible * 12
        ) % 2 === 0
    ) {

        return;
    }


    const centerX =
        player.x +
        player.width / 2;


    const headY =
        player.y + 10;


    let legOffset = 0;
    let armOffset = 0;


    if (
        player.state === "run"
    ) {

        const animation =
            Math.sin(
                player.animationTime *
                14
            );

        legOffset =
            animation * 6;

        armOffset =
            animation * 5;
    }


    if (
        player.state === "jump"
    ) {

        legOffset = -3;
        armOffset = 5;
    }


    if (
        player.state === "fall"
    ) {

        legOffset = 4;
        armOffset = -4;
    }


    ctx.save();


    ctx.strokeStyle =
        "#111827";

    ctx.fillStyle =
        "#111827";

    ctx.lineWidth = 5;

    ctx.lineCap =
        "round";


    /* Head */

    ctx.beginPath();

    ctx.arc(
        centerX,
        headY,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Body */

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


    /* Arms */

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        player.y + 25
    );

    ctx.lineTo(
        centerX - 15,
        player.y + 35 +
        armOffset
    );


    ctx.moveTo(
        centerX,
        player.y + 25
    );

    ctx.lineTo(
        centerX + 15,
        player.y + 35 -
        armOffset
    );

    ctx.stroke();


    /* Legs */

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        player.y + 42
    );

    ctx.lineTo(
        centerX - 12,
        player.y + 58 +
        legOffset
    );


    ctx.moveTo(
        centerX,
        player.y + 42
    );

    ctx.lineTo(
        centerX + 12,
        player.y + 58 -
        legOffset
    );

    ctx.stroke();


    ctx.restore();
}


/* =========================================================
   SPIKES
========================================================= */

function drawSpikes() {

    for (
        const spike of levelData.spikes
    ) {

        if (!spike.active) {
            continue;
        }


        const count =
            Math.max(
                1,
                Math.floor(
                    spike.width / 20
                )
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const x =
                spike.x +
                i * 20;


            ctx.fillStyle =
                "#dc2626";


            ctx.beginPath();

            ctx.moveTo(
                x,
                spike.y +
                spike.height
            );

            ctx.lineTo(
                x + 10,
                spike.y
            );

            ctx.lineTo(
                x + 20,
                spike.y +
                spike.height
            );

            ctx.closePath();

            ctx.fill();
        }
    }
}


/* =========================================================
   MOVING SPIKES
========================================================= */

function drawMovingSpikes() {

    for (
        const spike of levelData.movingSpikes
    ) {

        ctx.save();

        ctx.translate(
            spike.x +
            spike.width / 2,

            spike.y +
            spike.height / 2
        );

        ctx.rotate(
            Math.sin(
                spike.rotation
            ) * 0.05
        );


        ctx.fillStyle =
            "#991b1b";


        ctx.beginPath();

        ctx.moveTo(
            -spike.width / 2,
            spike.height / 2
        );

        ctx.lineTo(
            0,
            -spike.height / 2
        );

        ctx.lineTo(
            spike.width / 2,
            spike.height / 2
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }
}


/* =========================================================
   FIRE
========================================================= */

function drawFire() {

    for (
        const fire of levelData.fire
    ) {

        const flicker =
            Math.sin(
                fire.animation
            ) * 4;


        ctx.save();


        ctx.shadowColor =
            "rgba(249,115,22,0.7)";

        ctx.shadowBlur = 15;


        ctx.fillStyle =
            "#f97316";


        ctx.fillRect(
            fire.x,
            fire.y + 10,
            fire.width,
            fire.height - 10
        );


        ctx.shadowBlur = 0;


        const flameCount =
            Math.max(
                2,
                Math.floor(
                    fire.width / 15
                )
            );


        for (
            let i = 0;
            i < flameCount;
            i++
        ) {

            const x =
                fire.x +
                i *
                (fire.width /
                    flameCount) +
                5;


            ctx.fillStyle =
                i % 2 === 0
                    ? "#facc15"
                    : "#fb923c";


            ctx.beginPath();

            ctx.moveTo(
                x - 6,
                fire.y + 25
            );

            ctx.quadraticCurveTo(
                x - 3,
                fire.y +
                5 +
                flicker,
                x,
                fire.y -
                5 +
                flicker
            );

            ctx.quadraticCurveTo(
                x + 8,
                fire.y +
                8,
                x + 7,
                fire.y + 25
            );

            ctx.closePath();

            ctx.fill();
        }


        ctx.restore();
    }
}


/* =========================================================
   ROCKS
========================================================= */

function drawRocks() {

    for (
        const rock of levelData.rocks
    ) {

        ctx.save();

        ctx.translate(
            rock.x + 15,
            rock.y + 15
        );

        ctx.rotate(
            rock.rotation
        );


        ctx.fillStyle =
            "#4b5563";


        ctx.beginPath();

        ctx.moveTo(
            -15,
            -5
        );

        ctx.lineTo(
            -8,
            -15
        );

        ctx.lineTo(
            7,
            -12
        );

        ctx.lineTo(
            15,
            -2
        );

        ctx.lineTo(
            10,
            12
        );

        ctx.lineTo(
            -8,
            15
        );

        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#1f2937";

        ctx.stroke();


        ctx.restore();
    }
}


/* =========================================================
   BUTTONS
========================================================= */

function drawButtons() {

    for (
        const button of levelData.buttons
    ) {

        const pulse =
            Math.sin(
                button.pulse * 5
            ) * 2;


        ctx.save();


        ctx.shadowColor =
            button.pressed
                ? "#22c55e"
                : "#ef4444";

        ctx.shadowBlur =
            button.pressed
                ? 10
                : 5;


        ctx.fillStyle =
            button.pressed
                ? "#22c55e"
                : "#ef4444";


        ctx.fillRect(
            button.x,
            button.y -
            (button.pressed
                ? 0
                : Math.max(0, pulse)),
            button.width,
            button.height
        );


        ctx.restore();
    }
}


/* =========================================================
   KEYS
========================================================= */

function drawKeys() {

    for (
        const key of levelData.keys
    ) {

        if (key.collected) {
            continue;
        }


        const floatY =
            Math.sin(
                key.animation
            ) * 4;


        ctx.save();

        ctx.translate(
            key.x,
            key.y + floatY
        );

        ctx.rotate(
            Math.sin(
                key.animation
            ) * 0.1
        );


        ctx.strokeStyle =
            "#ca8a04";

        ctx.lineWidth = 4;


        ctx.beginPath();

        ctx.arc(
            7,
            10,
            6,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            12,
            10
        );

        ctx.lineTo(
            24,
            10
        );

        ctx.moveTo(
            20,
            10
        );

        ctx.lineTo(
            20,
            15
        );

        ctx.moveTo(
            16,
            10
        );

        ctx.lineTo(
            16,
            14
        );

        ctx.stroke();


        ctx.restore();
    }
}


/* =========================================================
   COINS
========================================================= */

function drawCoins() {

    for (
        const coin of levelData.coins
    ) {

        if (coin.collected) {
            continue;
        }


        const scale =
            0.7 +
            Math.abs(
                Math.sin(
                    coin.animation
                )
            ) * 0.3;


        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.scale(
            scale,
            1
        );


        ctx.fillStyle =
            "#facc15";


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle =
            "#ca8a04";

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.restore();
    }
}


/* =========================================================
   EXIT
========================================================= */

function drawExit() {

    const unlocked =
        exitUnlocked();


    const exit =
        levelData.exit;


    ctx.save();


    ctx.fillStyle =
        unlocked
            ? "#22c55e"
            : "#64748b";


    ctx.fillRect(
        exit.x,
        exit.y,
        exit.width,
        exit.height
    );


    ctx.strokeStyle =
        unlocked
            ? "#86efac"
            : "#94a3b8";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        exit.x,
        exit.y,
        exit.width,
        exit.height
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 11px Arial";


    ctx.fillText(
        unlocked
            ? "EXIT"
            : "LOCKED",

        exit.x - 5,

        exit.y - 10
    );


    ctx.restore();
}


/* =========================================================
   LEVEL INFO
========================================================= */

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


    /* Timer */

    if (
        timeLimit > 0
    ) {

        const elapsed =
            (now - levelStartTime) /
            1000;


        const remaining =
            Math.max(
                0,
                Math.ceil(
                    timeLimit -
                    elapsed
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


/* =========================================================
   DRAW
========================================================= */

function draw(now) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    if (screenShake > 0) {

        ctx.translate(
            randomFloat(
                -screenShake,
                screenShake
            ),
            randomFloat(
                -screenShake,
                screenShake
            )
        );
    }


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

    drawParticles();

    drawPlayer();


    ctx.restore();
}


/* =========================================================
   UPDATE
========================================================= */

function update(
    now,
    dt
) {

    if (
        !gameRunning ||
        paused
    ) {
        return;
    }


    dt =
        Math.min(
            dt,
            0.033
        );


    if (
        player.invincible > 0
    ) {

        player.invincible =
            Math.max(
                0,
                player.invincible -
                dt
            );
    }


    if (
        screenShake > 0
    ) {

        screenShake =
            Math.max(
                0,
                screenShake -
                dt * 35
            );
    }


    updatePlayer(dt);

    updateButtons(dt);

    updateMovingSpikes(dt);

    updateRocks(dt);

    updateFire(dt);

    updateParticles(dt);


    if (checkTraps()) {
        return;
    }


    checkKeys();

    checkCoins();

    checkExit();

    checkTimer(now);
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(now) {

    if (!lastTime) {
        lastTime = now;
    }


    const dt =
        (now - lastTime) /
        1000;


    lastTime = now;


    update(
        now,
        dt
    );


    draw(now);


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key;


        if (
            key === " " ||
            key.startsWith("Arrow")
        ) {

            event.preventDefault();
        }


        if (
            key.toLowerCase() === "p" ||
            key === "Escape"
        ) {

            if (!event.repeat) {
                togglePause();
            }

            return;
        }


        if (
            key.toLowerCase() === "r"
        ) {

            restartGame();

            return;
        }


        keys[key] = true;
    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key] = false;
    }
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

function holdButton(
    button,
    key
) {

    if (!button) {
        return;
    }


    const start = (event) => {

        event.preventDefault();

        keys[key] = true;

        button.setPointerCapture?.(
            event.pointerId
        );
    };


    const end = (event) => {

        event.preventDefault();

        keys[key] = false;
    };


    button.addEventListener(
        "pointerdown",
        start
    );

    button.addEventListener(
        "pointerup",
        end
    );

    button.addEventListener(
        "pointercancel",
        end
    );

    button.addEventListener(
        "pointerleave",
        end
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


if (jumpBtn) {

    jumpBtn.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            requestJump();
        }
    );
}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

    currentLevel = 1;

    score = 0;

    lives = 3;

    buttonPressed = 0;

    collectedKeys = 0;

    levelDamaged = false;

    paused = false;

    gameRunning = true;

    particles.length = 0;

    hidePause();

    startLevel();

    updateUI();
}


/* =========================================================
   ACTION BUTTON
========================================================= */

actionButton.addEventListener(
    "click",
    () => {

        if (
            messageTitle.textContent
                .toUpperCase()
                .includes("LEVEL COMPLETE")
        ) {

            nextLevel();

        } else {

            restartGame();
        }
    }
);


/* =========================================================
   INITIALIZE
========================================================= */

startLevel();

requestAnimationFrame(
    gameLoop
);

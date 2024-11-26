const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const gameSelect = document.getElementById("gameSelect");
const dpiInput = document.getElementById("dpiInput");
const sensitivityInput = document.getElementById("sensitivityInput");
const applySettings = document.getElementById("applySettings");
const dotSizeOptions = document.querySelectorAll(".dotSizeOption");
const timerDiv = document.getElementById("timer");
const accuracyDiv = document.getElementById("accuracy");
const counterDiv = document.getElementById("counter");

let dotsHit = 0;
let totalDots = 20;
let clicksMade = 0;
let gameStarted = false;
let timerStart = null;
let dotPosition = {};
let dotSize = 10; // Default dot size
let crosshairX = canvas.width / 2;
let crosshairY = canvas.height / 2;
let sensitivity = 1.0;
let isPointerLocked = false;

// Function to calculate sensitivity
const calculateSensitivity = (game, dpi, sensitivity) => {
    const scalingFactor = 0.005; // Adjust sensitivity scale for smoother movement
    if (game === "csgo") {
        return dpi * sensitivity * scalingFactor;
    } else if (game === "valorant") {
        return dpi * sensitivity * scalingFactor * 0.426;
    }
    return 1.0;
};

// Update dot size when clicked
dotSizeOptions.forEach((button) => {
    button.addEventListener("click", (e) => {
        dotSize = parseInt(e.target.dataset.size);
        dotSizeOptions.forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");
    });
});

// Function to spawn a dot
const spawnDot = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = Math.random() * (canvas.width - 2 * dotSize) + dotSize;
    const y = Math.random() * (canvas.height - 2 * dotSize) + dotSize;
    dotPosition = { x, y };

    ctx.beginPath();
    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    drawCrosshair();
};

// Draw crosshair
const drawCrosshair = () => {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the current dot
    ctx.beginPath();
    ctx.arc(dotPosition.x, dotPosition.y, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    // Draw horizontal crosshair line
    ctx.beginPath();
    ctx.moveTo(crosshairX - 15, crosshairY);
    ctx.lineTo(crosshairX + 15, crosshairY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw vertical crosshair line
    ctx.beginPath();
    ctx.moveTo(crosshairX, crosshairY - 15);
    ctx.lineTo(crosshairX, crosshairY + 15);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
};

// Handle mouse movement (crosshair movement)
document.addEventListener("mousemove", (e) => {
    if (!isPointerLocked) return;

    // Adjust crosshair position based on mouse movement and sensitivity
    crosshairX += e.movementX * sensitivity;
    crosshairY += e.movementY * sensitivity;

    // Constrain crosshair within the canvas bounds
    crosshairX = Math.max(0, Math.min(canvas.width, crosshairX));
    crosshairY = Math.max(0, Math.min(canvas.height, crosshairY));

    // Redraw the crosshair
    drawCrosshair();
});

// Handle mouse clicks (dot hit detection)
canvas.addEventListener("click", () => {
    if (!gameStarted) return;

    clicksMade++;

    // Check if the click is within the dot's area
    const distance = Math.sqrt(
        (crosshairX - dotPosition.x) ** 2 + (crosshairY - dotPosition.y) ** 2
    );

    if (distance <= dotSize) {
        dotsHit++;
    }

    // Update stats
    updateAccuracy();
    updateCounter();

    if (clicksMade >= totalDots) {
        endGame();
    } else {
        spawnDot();
    }
});

// Update accuracy
const updateAccuracy = () => {
    const accuracy = clicksMade > 0 ? (dotsHit / clicksMade) * 100 : 0;
    accuracyDiv.textContent = `Accuracy: ${accuracy.toFixed(2)}%`;
};

// Update dots hit counter
const updateCounter = () => {
    counterDiv.textContent = `Dots Hit: ${dotsHit} / ${totalDots}`;
};

// Start the game
startButton.addEventListener("click", () => {
    clicksMade = 0;
    dotsHit = 0;
    gameStarted = true;
    timerStart = performance.now();
    spawnDot();
    canvas.requestPointerLock();
    resetButton.style.display = "block";
});

// End the game
const endGame = () => {
    gameStarted = false;
    document.exitPointerLock();
    timerDiv.textContent = `Game Over!`;
    resetButton.style.display = "block";
};

// Reset the game
resetButton.addEventListener("click", () => {
    gameStarted = false;
    clicksMade = 0;
    dotsHit = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timerDiv.textContent = "Time: 0.0s";
    accuracyDiv.textContent = "Accuracy: 0%";
    counterDiv.textContent = "Dots Hit: 0 / 20";
});

// Pointer lock change event
document.addEventListener("pointerlockchange", () => {
    isPointerLocked = document.pointerLockElement === canvas;
    resetButton.style.display = isPointerLocked ? "none" : "block";
});

// Apply sensitivity settings
applySettings.addEventListener("click", () => {
    const game = gameSelect.value;
    const dpi = parseFloat(dpiInput.value);
    const inGameSensitivity = parseFloat(sensitivityInput.value);
    sensitivity = calculateSensitivity(game, dpi, inGameSensitivity);
    alert(`Sensitivity applied: ${sensitivity.toFixed(2)}`);
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const timerDiv = document.getElementById("timer");
const accuracyDiv = document.getElementById("accuracy");
const counterDiv = document.getElementById("counter");
const sizeOptions = document.querySelectorAll(".sizeOption");

let dotsHit = 0;
let totalDots = 20; // Total number of dots for the game
let clicksMade = 0; // Total number of clicks (hits + misses)
let gameStarted = false;
let timerStart = null;
let timerInterval = null;
let dotPosition = {};
let dotSize = 10; // Default dot size

// Spawn a dot at a random position
const spawnDot = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = Math.random() * (canvas.width - 2 * dotSize) + dotSize;
    const y = Math.random() * (canvas.height - 2 * dotSize) + dotSize;
    dotPosition = { x, y };

    // Draw the dot as a circle
    ctx.beginPath();
    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
};

// Update the timer
const updateTimer = () => {
    if (gameStarted) {
        const elapsedTime = ((performance.now() - timerStart) / 1000).toFixed(1); // Rounded to the tenth
        timerDiv.textContent = `Time: ${elapsedTime}s`;
    }
};

// Update accuracy
const updateAccuracy = () => {
    const accuracy = clicksMade > 0 ? (dotsHit / clicksMade) * 100 : 0; // Accuracy based on hits vs total clicks
    accuracyDiv.textContent = `Accuracy: ${accuracy.toFixed(2)}%`;
};

// Update counter
const updateCounter = () => {
    counterDiv.textContent = `Dots Hit: ${dotsHit} / ${totalDots}`;
};

// End the game
const endGame = () => {
    gameStarted = false;
    clearInterval(timerInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const finalTime = ((performance.now() - timerStart) / 1000).toFixed(1); // Final time to the tenth
    timerDiv.textContent = `Final Time: ${finalTime}s`;
    updateAccuracy(); // Ensure accuracy is updated at the end
};

// Reset the game
const resetGame = () => {
    gameStarted = false;
    dotsHit = 0;
    clicksMade = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(timerInterval);
    timerDiv.textContent = "Time: 0.0s";
    counterDiv.textContent = `Dots Hit: 0 / ${totalDots}`;
    accuracyDiv.textContent = "Accuracy: 0%";
};

// Canvas click event
canvas.addEventListener("click", (e) => {
    if (!gameStarted) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const distance = Math.sqrt(
        (clickX - dotPosition.x) ** 2 + (clickY - dotPosition.y) ** 2
    );

    clicksMade++; // Increment total clicks
    if (distance <= dotSize) {
        dotsHit++; // Increment hits only if click is inside the dot
    }

    updateCounter();
    updateAccuracy();

    // Check if the game is over
    if (clicksMade >= totalDots) {
        endGame();
    } else {
        spawnDot(); // Spawn a new dot
    }
});

// Start the game
startButton.addEventListener("click", () => {
    resetGame(); // Reset stats when starting
    timerStart = performance.now();
    gameStarted = true;
    spawnDot();
    timerInterval = setInterval(updateTimer, 100);
});

// Reset button click event
resetButton.addEventListener("click", resetGame);

// Set dot size and highlight selection
sizeOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
        dotSize = parseInt(option.dataset.size); // Set dot size
        sizeOptions.forEach((opt) => opt.classList.remove("selected")); // Remove selection highlight
        option.classList.add("selected"); // Highlight the selected option
    });
});

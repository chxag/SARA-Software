// Modes
let currentMode = null;
const modes = ["stack", "place", "rotate", "move", "delete", "robot"];
const modeLogos = {
    stack: document.getElementById("stack-logo"),
    place: document.getElementById("place-logo"),
    rotate: document.getElementById("rotate-logo"),
    move: document.getElementById("move-logo"),
    delete: document.getElementById("delete-logo"),
    robot: document.getElementById("robot-logo"),
};

const keyModeMapping = {
    1: "stack",
    S: "stack",
    2: "place",
    P: "place",
    3: "rotate",
    R: "rotate",
    4: "move",
    M: "move",
    5: "delete",
    D: "delete",
    6: "robot",
    X: "robot",
};

document.addEventListener("keydown", function (event) {
    const key = event.key.toUpperCase(); // Normalize the key to uppercase to match the mapping
    const mode = keyModeMapping[key];

    if (mode) {
        toggleMode(mode);
    }
});

// When any mode logo is clicked, call toggleMode
Object.keys(modeLogos).forEach((mode) => {
    modeLogos[mode].addEventListener("click", () => toggleMode(mode));
});

function toggleMode(selectedMode) {
    // Clear any highlights when a mode is selected
    document
        .querySelectorAll(".highlighted-yellow, .highlighted-blue")
        .forEach((el) =>
            el.classList.remove("highlighted-yellow", "highlighted-blue")
        );
    currentMode = currentMode === selectedMode ? null : selectedMode; // If selected mode is the current mode, current mode becomes nothing
    updateUIModes();

    selectedStack = null;
    selectedRotatingChair = null;
    selectedMovingChair = null;

    const existingPreview = document.querySelector(".preview-chair-container");
    const existingRobotPreview = document.querySelector(
        ".preview-robot-in-grid"
    );
    if (existingPreview) existingPreview.remove();
    if (existingRobotPreview) existingRobotPreview.remove();

    if (currentMode === "stack" && hoveredGridItem) {
        const previewChairContainer = createPreviewChair();
        hoveredGridItem.appendChild(previewChairContainer);
    }

    if (currentMode === "robot" && hoveredGridItem) {
        const previewRobot = document.createElement("img");
        previewRobot.src = "robot.png";
        previewRobot.alt = "Preview Robot";
        previewRobot.className = "preview-robot-in-grid";
        hoveredGridItem.appendChild(previewRobot);
    }

    document.getElementById("stack-counter").style.display = "none";
    document.getElementById("rotateControlPanel").style.display = "none";
}

// Function for green border around mode logo, and also for which mode is active
function updateUIModes() {
    modes.forEach((mode) => {
        const isActive = mode === currentMode;
        modeLogos[mode].classList.toggle("active-mode", isActive);
        if (!isActive) return;
        modes
            .filter((otherMode) => otherMode !== mode)
            .forEach((deactivateMode) => {
                // Deactivate other modes
                modeLogos[deactivateMode].classList.remove("active-mode");
            });
    });
}

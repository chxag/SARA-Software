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

    // If stack was selected in place mode, remove selection
    selectedStack = null;
    selectedRotatingChair = null;
    selectedMovingChair = null;
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

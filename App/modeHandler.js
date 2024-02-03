// Modes
let currentMode = null;
const modes = ["stack", "place", "rotate", "delete", "robot"];
const modeLogos = {
    stack: document.getElementById("stack-logo"),
    place: document.getElementById("place-logo"),
    rotate: document.getElementById("rotate-logo"),
    delete: document.getElementById("delete-logo"),
    robot: document.getElementById("robot-logo"),
};

// When any mode logo is clicked, call toggleMode
Object.keys(modeLogos).forEach((mode) => {
    modeLogos[mode].addEventListener("click", () => toggleMode(mode));
});

function toggleMode(selectedMode) {
    currentMode = currentMode === selectedMode ? null : selectedMode; // If selected mode is the current mode, current mode becomes nothing
    updateUIModes();
    if (selectedStack) {
        // If stack was selected in place mode, remove selection
        selectedStack.classList.remove("selected-in-grid");
        selectedStack = null;
    }
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

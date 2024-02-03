// Zoom button functionality
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");

zoomInButton.addEventListener("click", () => adjustGridSize(10)); // Increase grid size
zoomOutButton.addEventListener("click", () => adjustGridSize(-10)); // Decrease grid size

function adjustGridSize(change) {
    gridSize = Math.max(30, Math.min(gridSize + change, 100)); // Min 30px and max 100px
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;

    // Update the grid based on the new size
    updateGridCentering();

    // Calculate and update the font size for chair text based on the new grid size
    const newFontSize = calculateFontSize(gridSize);
    document.querySelectorAll(".chair-text-in-grid").forEach((element) => {
        element.style.fontSize = `${newFontSize}px`;
    });
}

// Calculation of font size for chair text based on the new grid size
function calculateFontSize(gridSize) {
    return gridSize * 0.17;
}

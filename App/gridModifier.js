let gridSize = 50; // Initial grid size in pixels

// Query URL parameters
const urlParams = new URLSearchParams(window.location.search);
let rows = parseInt(urlParams.get("rows"));
let columns = parseInt(urlParams.get("columns"));

function createGrid() {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear existing grid items

    // Check for query parameters first
    if (rows && columns) {
        createGridFromDimensions(rows, columns);
        localStorage.removeItem("gridData");
    } else {
        rows = 5;
        columns = 5;
        // Retrieve grid data from localStorage if no query parameters are found
        const gridDataJson = localStorage.getItem("gridData");
        if (gridDataJson && gridDataJson !== "null") {
            try {
                const gridData = JSON.parse(gridDataJson);
                createGridFromData(gridData);
            } catch (error) {
                console.error(
                    "Error parsing grid data from localStorage:",
                    error
                );
                alert("Invalid grid data. Using fallback grid size.");
                createGridFromDimensions(rows, columns); // Use fallback grid size if data is invalid
            }
        } else {
            createGridFromDimensions(rows, columns); // Use default grid size if no data is found
        }
    }
}

function createGridFromData(gridData) {
    // Update rows and columns based on gridData dimensions
    rows = gridData.length;
    columns = gridData[0].length;
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
            const cell = gridData[rowIndex][columnIndex];
            const gridItem = document.createElement("div");
            gridItem.className = "grid-item" + (cell === 0 ? " black" : ""); // black class for cells with value 0
            gridItem.id = `item-${rowIndex + 1}-${columnIndex + 1}`; // Location of grid item
            gridContainer.appendChild(gridItem);
        }
    }
}

function createGridFromDimensions(rows, columns) {
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;

    for (let row = 1; row <= rows; row++) {
        for (let column = 1; column <= columns; column++) {
            const gridItem = document.createElement("div");
            gridItem.className = "grid-item";
            gridItem.id = `item-${row}-${column}`; // Location of grid item
            gridContainer.append(gridItem);
        }
    }
}

function updateGridCentering() {
    // Calculate the total grid width
    const totalGridWidth = columns * gridSize;
    const gridContainer = document.querySelector(".grid-container");

    // Check if the grid overflows the viewport width
    if (totalGridWidth > window.innerWidth) {
        // Grid overflows, set justify-content to flex-start
        gridContainer.style.justifyContent = "flex-start";
    } else {
        // No overflow, center the grid
        gridContainer.style.justifyContent = "center";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    createGrid();
    updateGridCentering();
});

window.addEventListener("resize", updateGridCentering);

document.getElementById("clear-layout").addEventListener("click", function () {
    createGrid();
    updateGridCentering();
    allocatedNumbers.clear();
    defaultRotationDegree = 0;
    Object.keys(allocatedCNumbersByStack).forEach((key) => {
        delete allocatedCNumbersByStack[key];
    });
});

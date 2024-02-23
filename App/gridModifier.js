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
    } else {
        rows = 5;
        columns = 5;
        fetch("http://localhost:8082/latest_grid_data")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("No grid data available");
                }
                return response.json();
            })
            .then((gridData) => {
                // console.log(gridData);
                createGridFromData(gridData);
            })
            .catch((error) => {
                console.error("Error fetching grid data:", error);
                // alert("Invalid grid data. Using fallback grid size.");
                createGridFromDimensions(rows, columns); // Fallback grid size
            });
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

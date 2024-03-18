let gridSize = 50; // Initial grid size in pixels

// Query URL parameters
let urlParams = new URLSearchParams(window.location.search);
let rows;
let columns;
const parsedRows = parseInt(urlParams.get("rows"));
const parsedColumns = parseInt(urlParams.get("columns"));
const useTempLayout = urlParams.get("useTempLayout");
let layoutName = urlParams.get("layoutName");

function createGrid() {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear existing grid items

    // Check for query parameters first
    if (parsedRows && parsedColumns) {
        rows = parsedRows;
        columns = parsedColumns;
        createGridFromDimensions(rows, columns);
    } else {
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
                rows = 5;
                columns = 5;
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

function createSavedGrid(gridDataJson) {
    const gridData = JSON.parse(gridDataJson);

    // Set up the grid dimensions
    rows = gridData.dimensions.rows;
    columns = gridData.dimensions.columns;
    createGridFromDimensions(rows, columns);

    // Place robot if present
    if (gridData.robot) {
        const robotLocation = gridData.robot.split("-");
        const robotGridItem = document.getElementById(
            `item-${robotLocation[0]}-${robotLocation[1]}`
        );
        addOrRemoveRobot(robotGridItem);
    }

    // Place stacks and chairs
    gridData.stacks.forEach((stack) => {
        const stackLocation = stack.location.split("-");
        const stackGridItem = document.getElementById(
            `item-${stackLocation[0]}-${stackLocation[1]}`
        );
        addStack(stackGridItem, stack.rotation);

        selectedStack = stackGridItem;

        // For each chair in the stack
        stack.chairs.forEach((chair) => {
            const chairLocation = chair.location.split("-");
            const chairGridItem = document.getElementById(
                `item-${chairLocation[0]}-${chairLocation[1]}`
            );
            handlePlaceMode(chairGridItem, chair.rotation);
        });
    });

    document.getElementById("stack-counter").style.display = "none"; // Hide the counter
    selectedStack = null;

    // Place obstacles
    gridData.obstacles.forEach((obstacle) => {
        const obstacleLocation = obstacle.split("-");
        const obstacleGridItem = document.getElementById(
            `item-${obstacleLocation[0]}-${obstacleLocation[1]}`
        );
        obstacleGridItem.classList.add("black");
    });

    highlightInaccessibleChairs();
}

document.addEventListener("DOMContentLoaded", function () {
    clearLayout();
    if (layoutName) {
        const gridDataJson = localStorage.getItem(
            decodeURIComponent(layoutName)
        );
        if (gridDataJson) {
            createSavedGrid(gridDataJson);
        } else {
            alert("Layout not found in LocalStorage.");
            createGrid();
        }
    } else if (useTempLayout === "true") {
        // Retrieve the temporary layout from sessionStorage
        const tempLayoutJson = sessionStorage.getItem("tempLayout");
        if (tempLayoutJson) {
            createSavedGrid(tempLayoutJson);
            // Optionally, clear the temporary layout from sessionStorage after use
            sessionStorage.removeItem("tempLayout");
        } else {
            alert("No layout data found.");
            createGrid();
        }
    } else {
        // Your usual grid initialization logic
        createGrid();
    }
    updateGridCentering();
});

window.addEventListener("resize", updateGridCentering);

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

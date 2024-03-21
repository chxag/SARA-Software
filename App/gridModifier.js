let gridSize = 50; // Initial grid size in pixels

// Query URL parameters
let urlParams = new URLSearchParams(window.location.search);
let rows;
let columns;
const parsedRows = parseInt(urlParams.get("rows"));
const parsedColumns = parseInt(urlParams.get("columns"));
const useTempLayout = urlParams.get("useTempLayout");
let layoutName = urlParams.get("layoutName");
const loadingText = document.getElementById("loading-text");
if (loadingText) loadingText.classList.remove("hidden");

function createGrid() {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear existing grid items

    // Check for query parameters first
    if (parsedRows && parsedColumns) {
        rows = parsedRows;
        columns = parsedColumns;
        createGridFromDimensions(rows, columns);
        localStorage.removeItem("previousLayout");
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
                localStorage.removeItem("previousLayout");
            })
            .catch((error) => {
                console.error("Error fetching grid data:", error);

                const previousLayout = localStorage.getItem("previousLayout");

                if (previousLayout) {
                    window.location.href = `index.html?layoutName=${previousLayout}`;
                    return;
                }

                localStorage.removeItem("previousLayout");

                // alert("Invalid grid data. Using fallback grid size.");
                const mostRecentGrid = localStorage.getItem("mostRecentGrid");
                const data = JSON.parse(mostRecentGrid);
                if (mostRecentGrid && data.dimensions != null) {
                    createSavedGrid(mostRecentGrid); // Load the most recent grid as default
                } else {
                    rows = 5;
                    columns = 5;
                    createGridFromDimensions(rows, columns); // Fallback grid size
                }
            });
    }
}

function createGridFromData(gridData) {
    if (loadingText) loadingText.classList.add("hidden");

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
    const gridDataJson = generateGridDataJson();
    localStorage.setItem("mostRecentGrid", gridDataJson); // Store the most recent grid JSON
    updateGridCentering();
    displayLayoutData();
}

function createGridFromDimensions(rows, columns) {
    if (loadingText) loadingText.classList.add("hidden");
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;

    for (let row = 1; row <= rows; row++) {
        for (let column = 1; column <= columns; column++) {
            const gridItem = document.createElement("div");
            gridItem.className = "grid-item";
            gridItem.id = `item-${row}-${column}`; // Location of grid item
            gridContainer.append(gridItem);
        }
    }

    const gridDataJson = generateGridDataJson();
    localStorage.setItem("mostRecentGrid", gridDataJson); // Store the most recent grid JSON
    updateGridCentering();
    displayLayoutData();
}

function createSavedGrid(gridDataJson) {
    if (loadingText) loadingText.classList.add("hidden");
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

    localStorage.setItem("mostRecentGrid", gridDataJson); // Store the most recent grid JSON
    highlightInaccessibleChairs();
    updateGridCentering();
    displayLayoutData();
}

document.addEventListener("DOMContentLoaded", function () {
    document.title = "SARA";

    // Set a timeout of 1 second to check for image load completion
    setTimeout(() => {
        const allImagesLoaded = Array.from(
            document.querySelectorAll("img")
        ).every((img) => img.complete);

        if (!allImagesLoaded) {
            console.log(
                "Not all images were loaded within 1 second. Refreshing..."
            );
            window.location.reload(); // Refresh the page
        } else {
            console.log("All images loaded successfully.");
        }
    }, 1000); // 1000 milliseconds = 1 second

    clearLayout();
    if (layoutName) {
        const gridDataJson = localStorage.getItem(
            decodeURIComponent(layoutName)
        );
        try {
            // Attempt to parse the item value as JSON
            JSON.parse(gridDataJson);
            createSavedGrid(gridDataJson);
            localStorage.setItem("previousLayout", layoutName);
            document.title = `${layoutName} - SARA`;
        } catch (e) {
            // alert(e);
            window.history.replaceState(null, "", window.location.pathname);
            createGrid();
        }
    } else if (useTempLayout === "true") {
        localStorage.removeItem("previousLayout");
        // Retrieve the temporary layout from sessionStorage
        const tempLayoutJson = sessionStorage.getItem("tempLayout");
        if (tempLayoutJson) {
            createSavedGrid(tempLayoutJson);
            // Optionally, clear the temporary layout from sessionStorage after use
            sessionStorage.removeItem("tempLayout");
        } else {
            // alert("No layout data found.");
            window.history.replaceState(null, "", window.location.pathname);
            createGrid();
        }
    } else {
        createGrid();
    }
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

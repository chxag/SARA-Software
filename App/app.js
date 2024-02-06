// This file is not included in the HTML files, it's just all the JavaScript code in one file (may not be updated).

let gridSize = 50; // Initial grid size in pixels

// Initialise default values and query URL parameters
const urlParams = new URLSearchParams(window.location.search);
let rows = parseInt(urlParams.get("rows"));
let columns = parseInt(urlParams.get("columns"));

function createGridFromData(gridData) {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear existing grid items

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
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear existing grid items
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
    // Check for query parameters first
    if (rows && columns) {
        createGridFromDimensions(rows, columns);
        localStorage.removeItem("gridData");
    } else {
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
                createGridFromDimensions(5, 5); // Use fallback grid size if data is invalid
            }
        } else {
            createGridFromDimensions(5, 5); // Use default grid size if no data is found
        }
    }

    // Update grid centering
    updateGridCentering();
});

window.addEventListener("resize", updateGridCentering);

// Zoom button functionality
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");

zoomInButton.addEventListener("click", () => adjustGridSize(10)); // Increase grid size
zoomOutButton.addEventListener("click", () => adjustGridSize(-10)); // Decrease grid size

function adjustGridSize(change) {
    gridSize = Math.max(30, Math.min(gridSize + change, 100)); // Min 30px and max 100px
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, ${gridSize}px)`;

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

// Grid, stack, chair numbering data
const gridContainer = document.querySelector(".grid-container");
let selectedStack = null;

// Stack/chair number calculation
const allocatedCNumbersByStack = {}; // for C chairs (chairs associated with stacks, e.g. C1 (S1), C2 (S2))
const allocatedNumbers = new Set(); // for stacks

// Increase number from 1 until non-taken number (for stacks)
function getLowestAvailableNumber() {
    let num = 1;
    while (allocatedNumbers.has(num)) {
        num++;
    }
    return num;
}

// Increase number from 1 until non-taken number (for C chairs)
function getLowestAvailableCNumber(stackId) {
    if (!allocatedCNumbersByStack[stackId]) {
        // Add new set in array if stack doesn't have its set of chairs yet
        allocatedCNumbersByStack[stackId] = new Set();
    }
    let num = 1;
    while (allocatedCNumbersByStack[stackId].has(num)) {
        num++;
    }
    allocatedCNumbersByStack[stackId].add(num); // Used C number for this stack
    return num;
}

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

// Used for mouse holding functionality
let lastGridItem;
let isMouseDown = false;

// When mouse is held down, set isMouseDown to true
gridContainer.addEventListener("mousedown", (event) => {
    // Left click button code is 0
    if (event.button === 0) {
        isMouseDown = true;
        handleGridClick(event);
    }
});

// When mouse is released, set isMouseDown to false
document.addEventListener("mouseup", () => {
    isMouseDown = false;
});

// When mouse is held down and hovering over a grid item
gridContainer.addEventListener("mouseover", (event) => {
    const gridItem = event.target.closest(".grid-item");
    if (isMouseDown && gridItem !== lastGridItem) {
        handleGridClick(event);
    }
});

// Prevent images from being dragged
gridContainer.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

// Functionality depends on which mode is active
function handleGridClick(event) {
    const gridItem = event.target.closest(".grid-item");
    if (!gridItem) return; // Exit if clicked object is not a grid item

    switch (currentMode) {
        case "stack":
            addStack(gridItem);
            break;
        case "place":
            handlePlaceMode(gridItem);
            break;
        case "rotate":
            rotateChair(gridItem);
            break;
        case "delete":
            deleteChair(gridItem);
            break;
        case "robot":
            addOrRemoveRobot(gridItem);
            break;
        default:
            break;
    }

    lastGridItem = gridItem;
}

function addStack(gridItem) {
    if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
    if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

    const chairContainer = gridItem.querySelector(".chair-container-in-grid"); // Check if there's a chair on grid item
    if (chairContainer) return; // Skip if there is a chair already

    // If there's no chair container, add a new stack
    const number = getLowestAvailableNumber();
    allocatedNumbers.add(number);

    const container = document.createElement("div");
    container.className = "chair-container-in-grid"; // contains both image and text

    // Chair image
    const chairImage = document.createElement("img");
    chairImage.src = "chair.png";
    chairImage.alt = "Chair";
    chairImage.className = "chair-in-grid";
    chairImage.draggable = false;

    // Chair text
    const chairText = document.createElement("span");
    chairText.textContent = `S${number}`;
    chairText.className = "chair-text-in-grid";
    chairText.style.fontSize = `${calculateFontSize(gridSize)}px`;

    // Add stack to grid item
    container.append(chairImage, chairText);
    gridItem.appendChild(container);
}

function handlePlaceMode(gridItem) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");

    // To not get mixed up with stacks
    const isChairContainer = !!chairContainer;
    const isCChair =
        isChairContainer &&
        chairContainer
            .querySelector(".chair-text-in-grid")
            .textContent.startsWith("C");

    // If stack selected already and clicked grid item is not a chair
    if (!isChairContainer && selectedStack) {
        if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
        if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

        const stackText = selectedStack.querySelector(
            ".chair-text-in-grid"
        ).textContent; // e.g., "S1"
        const cNumber = getLowestAvailableCNumber(stackText); // Get the lowest available C number for this stack

        const container = document.createElement("div");
        container.className = "chair-container-in-grid"; // contains both image and text

        // Chair image
        const chairImage = document.createElement("img");
        chairImage.src = "chair.png";
        chairImage.alt = "Chair";
        chairImage.className = "chair-in-grid";
        chairImage.draggable = false;

        // Chair text
        const chairText = document.createElement("span");
        chairText.textContent = `C${cNumber} (${stackText})`;
        chairText.className = "chair-text-in-grid";
        chairText.style.fontSize = `${calculateFontSize(gridSize)}px`;

        // Add C chair associated with the selected stack
        container.append(chairImage, chairText);
        gridItem.appendChild(container);

        // If clicked grid item is a chair but not a C chair, then a stack must be clicked
    } else if (chairContainer && !isCChair) {
        // Selecting or deselecting a stack
        if (selectedStack === gridItem) {
            // Deselect if the same stack is clicked again
            selectedStack.classList.remove("selected-in-grid");
            selectedStack = null;
        } else {
            // Select a new stack
            if (selectedStack)
                selectedStack.classList.remove("selected-in-grid");
            selectedStack = gridItem;
            gridItem.classList.add("selected-in-grid");
        }
    }
}

function rotateChair(gridItem) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (!chairContainer) return; // Skip if there is no chair

    const chairImage = chairContainer.querySelector(".chair-in-grid");
    // Don't rotate robot
    if (chairImage) {
        const currentRotation = parseInt(chairImage.dataset.rotation || 0); // Default of 0
        const newRotation = (currentRotation + 90) % 360;
        chairImage.style.transform = `rotate(${newRotation}deg)`;
        chairImage.dataset.rotation = newRotation.toString();
    }
}

function deleteChair(gridItem) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (!chairContainer) return; // Skip if there is no chair

    // Check if stack or C chair
    const chairTextContent = chairContainer.querySelector(
        ".chair-text-in-grid"
    ).textContent;

    if (chairTextContent.startsWith("S")) {
        // Deleting a stack, remove it along with all associated C chairs
        const stackId = chairTextContent; // e.g., "S1"
        gridItem.removeChild(chairContainer); // Remove the S chair
        allocatedNumbers.delete(parseInt(stackId.slice(1))); // Remove from allocatedNumbers

        // Remove all C chairs associated with this stack
        document
            .querySelectorAll(
                ".grid-item .chair-container-in-grid .chair-text-in-grid"
            )
            .forEach((chairText) => {
                // for all chairs
                if (chairText.textContent.includes(`(${stackId})`)) {
                    // e.g. "(S1)"
                    const cChairContainer = chairText.closest(
                        ".chair-container-in-grid"
                    ); // select C chair
                    cChairContainer.parentElement.removeChild(cChairContainer); // delete C chair
                }
            });

        // Clear allocated C numbers for this stack
        if (allocatedCNumbersByStack[stackId]) {
            allocatedCNumbersByStack[stackId].clear();
            delete allocatedCNumbersByStack[stackId];
        }
    } else if (chairTextContent.startsWith("C")) {
        // Deleting a C chair, remove it individually
        // Parse the stack ID and C number from the chair's text
        const match = chairTextContent.match(/C(\d+) \(S(\d+)\)/);
        if (match) {
            const cNum = parseInt(match[1]);
            const stackId = `S${match[2]}`;
            // Delete the C chair and update the allocated numbers
            allocatedCNumbersByStack[stackId]?.delete(cNum);
            gridItem.removeChild(chairContainer);
        }
    }
}

function addOrRemoveRobot(gridItem) {
    if (gridItem.querySelector(".chair-container-in-grid")) return; // Skip if there's a chair
    if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

    const hasRobot = gridItem.querySelector(".robot-in-grid"); // Check if there's a robot on grid item

    // Remove an existing robot from the grid, if any
    const existingRobot = document.querySelector(".robot-in-grid");
    if (existingRobot) existingRobot.parentElement.removeChild(existingRobot);

    // If there was no robot in the clicked grid item, add a new one
    if (!hasRobot) {
        const robotImage = document.createElement("img");
        robotImage.src = "robot.png";
        robotImage.alt = "Robot";
        robotImage.className = "robot-in-grid";
        robotImage.draggable = false;
        gridItem.appendChild(robotImage);
    }
}

// JSON Output
function generateGridDataJson() {
    const gridData = {
        dimensions: { rows, columns },
        robot: null,
        stacks: [],
        obstacles: [],
    };

    // Robot location
    const robotElement = document.querySelector(".robot-in-grid");
    if (robotElement) {
        gridData.robot = robotElement.parentElement.id.replace("item-", ""); // Remove 'item-' prefix to get the location
    }

    // Iterate through all grid items to find stacks, chairs, and obstacles
    document.querySelectorAll(".grid-item").forEach((item) => {
        // Check for obstacles
        if (item.classList.contains("black")) {
            const obstacleLocation = item.id.replace("item-", ""); // Remove 'item-' prefix to get the location
            gridData.obstacles.push(obstacleLocation); // Add to obstacles list
        }

        const chairContainer = item.querySelector(".chair-container-in-grid");

        // If chair exists
        if (chairContainer) {
            const chairTextElement = chairContainer.querySelector(
                ".chair-text-in-grid"
            );
            const chairText = chairTextElement
                ? chairTextElement.textContent
                : "";
            const chairImage = chairContainer.querySelector(".chair-in-grid");
            const rotation = chairImage.dataset.rotation || 0;

            if (chairText.startsWith("S")) {
                // Stack found
                const stackLocation = item.id.replace("item-", ""); // Remove 'item-' prefix to get the location
                const stack = {
                    location: stackLocation,
                    rotation: parseInt(rotation, 10),
                    chairs: [],
                };

                // Find all associated C chairs
                document
                    .querySelectorAll(".chair-text-in-grid")
                    .forEach((cChairText) => {
                        // Check if the chair text includes the current stack's ID and it's not the stack itself
                        if (
                            cChairText.textContent.includes(`(${chairText})`) &&
                            cChairText !== chairTextElement
                        ) {
                            // Includes both image and text
                            const cChairContainer = cChairText.closest(
                                ".chair-container-in-grid"
                            );
                            // Chair image
                            const cChairImage =
                                cChairContainer.querySelector(".chair-in-grid");
                            // Chair rotation
                            const cRotation = cChairImage.dataset.rotation || 0;
                            const cChairLocation =
                                cChairContainer.parentElement.id.replace(
                                    "item-",
                                    ""
                                ); // Remove 'item-' prefix to get the location
                            // Add C chair to the stack's 'chairs' array
                            stack.chairs.push({
                                location: cChairLocation,
                                rotation: parseInt(cRotation, 10),
                            });
                        }
                    });

                // Add the fully constructed stack object to the 'stacks' array in the gridData object
                gridData.stacks.push(stack);
            }
        }
    });

    // Convert the grid data object to a JSON string
    const gridDataJson = JSON.stringify(gridData, null, 2); // Pretty print the JSON

    return gridDataJson;
}

const sendData = () => {
    const gridDataJson = generateGridDataJson();
    console.log(gridDataJson);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8082");

    xhr.responseType = "json";
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 201) {
            console.log("no");
        } else {
            console.log(`Error: ${xhr.status}`);
        }
    };

    xhr.send(gridDataJson);
    console.log("Grid JSON data sent to server.");
};

document.getElementById("send-json").addEventListener("click", sendData);

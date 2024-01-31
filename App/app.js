let gridSize = 50; // Initial grid size in pixels

// Initialise default values and query URL parameters
const urlParams = new URLSearchParams(window.location.search);
const rows = parseInt(urlParams.get("rows")) || 5; // Default to 5 if not provided
const columns = parseInt(urlParams.get("columns")) || 5; // Default to 5 if not provided

// Function to create and adjust the grid based on rows and columns
function createGrid(rows, columns) {
    const gridContainer = document.querySelector(".grid-container");
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;
    gridContainer.innerHTML = ""; // Clear existing grid items

    // Populate the grid with items
    for (let row = 1; row <= rows; row++) {
        for (let column = 1; column <= columns; column++) {
            const gridItem = document.createElement("div");
            gridItem.className = "grid-item";
            gridItem.id = `item-${row}-${column}`; // location of grid item
            gridContainer.append(gridItem);
        }
    }
}

// Populate the grid
createGrid(rows, columns);

// Zoom button functionality
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");

zoomInButton.addEventListener("click", () => adjustGridSize(10)); // Increase grid size
zoomOutButton.addEventListener("click", () => adjustGridSize(-10)); // Decrease grid size

function adjustGridSize(change) {
    gridSize = Math.max(30, Math.min(gridSize + change, 100)); // Min 30px and max 100px
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, ${gridSize}px)`;

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

// Grid, stack, chair numbering data
const gridContainer = document.querySelector(".grid-container");
let selectedStack = null;

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

// Stack/chair number calculation
const allocatedCNumbersByStack = {}; // for C chairs (chairs associated with stacks, e.g. C1 (S1), C2 (S2))
const allocatedNumbers = new Set(); // for stacks

// Increase number from 1 until non-taken number
function getLowestAvailableNumber() {
    let num = 1;
    while (allocatedNumbers.has(num)) {
        num++;
    }
    return num;
}

// Increase number from 1 until non-taken number
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

function addStack(gridItem) {
    if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot

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
document
    .getElementById("output-json") // if button is clicked
    .addEventListener("click", function (event) {
        event.preventDefault(); // Prevent any default button action

        const gridData = {
            dimensions: { rows, columns },
            robot: null,
            stacks: [],
        };

        // Robot location
        const robotElement = document.querySelector(".robot-in-grid");
        if (robotElement) {
            gridData.robot = robotElement.parentElement.id.replace("item-", ""); // Remove 'item-' prefix to get the location
        }

        // Iterate through all grid items to find stacks and chairs
        document.querySelectorAll(".grid-item").forEach((item) => {
            const chairContainer = item.querySelector(
                ".chair-container-in-grid"
            );

            // If chair exists
            if (chairContainer) {
                const chairText = chairContainer.querySelector(
                    ".chair-text-in-grid"
                ).textContent;
                const chairImage =
                    chairContainer.querySelector(".chair-in-grid");
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
                                cChairText.textContent.includes(chairText) &&
                                cChairText !== chairTextElement
                            ) {
                                // Includes both image and text
                                const cChairContainer = cChairText.closest(
                                    ".chair-container-in-grid"
                                );
                                // Chair image
                                const cChairImage =
                                    cChairContainer.querySelector(
                                        ".chair-in-grid"
                                    );
                                // Chair rotation
                                const cRotation =
                                    cChairImage.dataset.rotation || 0;
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

        // Output the JSON string
        console.log(gridDataJson); // Log to the console (inspect in Google Chrome)
    });
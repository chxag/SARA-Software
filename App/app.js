// This file is not included in the HTML files, it's just all the JavaScript code in one file (may not be updated).

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

    // Reposition the rotation control if a chair is currently active
    if (activeChair) {
        positionRotationControl(activeChair);
    }
}

// Calculation of font size for chair text based on the new grid size
function calculateFontSize(gridSize) {
    return gridSize * 0.17;
}

// Grid, stack, chair numbering data
const gridContainer = document.querySelector(".grid-container");
let selectedStack = null; // Stack mode
let selectedMovingChair = null; // Move mode
let selectedRotatingChair = null; // Rotate mode
let defaultRotationDegree = 0; // Default rotation degree for new chairs
const maxChairsPerStack = 3; // Maximum C chairs per stack
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

function getLowestAvailableCNumber(stackId) {
    if (allocatedCNumbersByStack[stackId] === undefined) {
        allocatedCNumbersByStack[stackId] = 0; // Initialize with 0 C chairs
    }
    if (allocatedCNumbersByStack[stackId] >= maxChairsPerStack) {
        return null; // No more C chairs can be added
    }
    // Increment the count since we're adding a new C chair
    return ++allocatedCNumbersByStack[stackId];
}

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

// Used for mouse holding functionality
let lastGridItem;
let isMouseDown = false;
let isQuickClick; // Variable to determine if it's a quick click
let holdTimeoutId; // Variable to store the timeout ID

gridContainer.addEventListener("pointerdown", (event) => {
    if (event.button === 0) {
        isMouseDown = true;
        isQuickClick = true;

        if (currentMode === "rotate") {
            holdTimeoutId = setTimeout(() => {
                if (isMouseDown) {
                    // If the mouse is still down, it's a hold
                    isQuickClick = false; // Not a quick click
                    handleGridClick(event);
                }
            }, 300); // Differentiate between click and hold
        } else {
            handleGridClick(event);
        }
    }
});

document.addEventListener("pointerdown", (event) => {
    const rotateControlPanel = document.getElementById("rotateControlPanel");

    // Check if rotateControlPanel exists and is currently displayed
    if (rotateControlPanel && rotateControlPanel.style.display !== "none") {
        // Check if the click is outside the rotateControlPanel
        const gridItem = event.target.closest(".grid-item");
        if (
            !rotateControlPanel.contains(event.target) &&
            gridItem !== lastGridItem
        ) {
            // Hide the control panel and remove highlighting from the active chair if any
            rotateControlPanel.style.display = "none";
            if (activeChair) {
                activeChair.classList.remove("highlighted-yellow");
                activeChair = null; // Reset active chair
            }
        }
    }
});

document.addEventListener("pointerup", (event) => {
    if (isMouseDown && isQuickClick && currentMode === "rotate") {
        handleGridClick(event);
    }

    isMouseDown = false; // Reset mouse down status
    clearTimeout(holdTimeoutId);
});

// When mouse is held down and hovering over a grid item
gridContainer.addEventListener("pointerover", (event) => {
    const gridItem = event.target.closest(".grid-item");
    if (isMouseDown && gridItem !== lastGridItem) {
        isQuickClick = true;
        handleGridClick(event);
    }
});

// Functionality depends on which mode is active
function handleGridClick(event) {
    const gridItem = event.target.closest(".grid-item");
    if (!gridItem) return; // Exit if clicked object is not a grid item#

    switch (currentMode) {
        case "stack":
            addStack(gridItem);
            break;
        case "place":
            handlePlaceMode(gridItem);
            break;
        case "rotate":
            rotateChair(gridItem, isQuickClick);
            break;
        case "move":
            moveChair(gridItem);
            break;
        case "delete":
            deleteChair(gridItem);
            break;
        case "robot":
            addOrRemoveRobot(gridItem);
            break;
        default:
            toggleHighlight(gridItem);
            break;
    }

    lastGridItem = gridItem;
}

document.getElementById("rotationButton").addEventListener("click", () => {
    const rotationRangeValue = document.getElementById("rotationRange").value;
    defaultRotationDegree = parseInt(rotationRangeValue); // Update the default rotation degree
});

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
    chairImage.style.transform = `rotate(${defaultRotationDegree}deg)`; // Apply the default rotation degree
    // chairImage.draggable = false;

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

        if (cNumber === null) {
            return; // Stop if the limit is reached
        }

        const container = document.createElement("div");
        container.className = "chair-container-in-grid"; // contains both image and text

        // Chair image
        const chairImage = document.createElement("img");
        chairImage.src = "chair.png";
        chairImage.alt = "Chair";
        chairImage.className = "chair-in-grid";
        chairImage.style.transform = `rotate(${defaultRotationDegree}deg)`; // Apply the default rotation degree
        // chairImage.draggable = false;

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
            selectedStack.classList.remove("highlighted-yellow");
            selectedStack = null;
        } else {
            // Select a new stack
            if (selectedStack)
                selectedStack.classList.remove("highlighted-yellow");
            selectedStack = gridItem;
            gridItem.classList.add("highlighted-yellow");
        }
    }
}

function rotateChair(gridItem, isQuickClick) {
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (!chairContainer) return; // Exit if there's no chair container

    const chairImage = chairContainer.querySelector(".chair-in-grid");

    if (isQuickClick) {
        // For a quick click, rotate the chair image by 90 degrees immediately
        let currentRotation =
            parseInt(chairImage.dataset.rotation) || defaultRotationDegree;
        currentRotation = (currentRotation + 90) % 360; // Increment by 90 degrees, wrap around at 360
        chairImage.dataset.rotation = currentRotation;
        chairImage.style.transform = `rotate(${currentRotation}deg)`;
        if (selectedRotatingChair) {
            selectedRotatingChair.classList.remove("highlighted-yellow");
            document.getElementById("rotateControlPanel").style.display =
                "none";
            selectedRotatingChair = null;
        }
    } else {
        // For holding, show the rotation control panel and highlight the chair
        if (chairContainer !== selectedRotatingChair) {
            if (selectedRotatingChair) {
                selectedRotatingChair.classList.remove("highlighted-yellow");
            }
            chairContainer.classList.add("highlighted-yellow");
            selectedRotatingChair = chairContainer;
            document.getElementById("rotateControlPanel").style.display =
                "flex";

            const rotationRange = document.getElementById("rotationRange");
            const rotationDegree = document.getElementById("rotationDegree");

            // Set the initial value and text
            rotationRange.value =
                chairImage.dataset.rotation || defaultRotationDegree;
            rotationDegree.textContent = `${rotationRange.value}°`;

            rotationRange.oninput = function () {
                rotationDegree.textContent = `${this.value}°`;
                chairImage.style.transform = `rotate(${this.value}deg)`;
                chairImage.dataset.rotation = this.value;
            };
        } else {
            selectedRotatingChair.classList.remove("highlighted-yellow");
            document.getElementById("rotateControlPanel").style.display =
                "none";
            selectedRotatingChair = null;
        }
    }
}

function moveChair(gridItem) {
    if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
    if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

    const chairContainer = gridItem.querySelector(".chair-container-in-grid");

    // If there's a selected chair to move and the current grid item is empty
    if (selectedMovingChair && !chairContainer) {
        // Move the selected chair to the new grid item
        gridItem.appendChild(selectedMovingChair);
    } else if (chairContainer !== selectedMovingChair) {
        if (selectedMovingChair) {
            selectedMovingChair.classList.remove("highlighted-yellow");
        }
        chairContainer.classList.add("highlighted-yellow");
        selectedMovingChair = chairContainer;
    } else {
        selectedMovingChair.classList.remove("highlighted-yellow");
        selectedMovingChair = null;
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
            delete allocatedCNumbersByStack[stackId];
        }

        const stackNumber = parseInt(stackId.substring(1));

        document
            .querySelectorAll(".chair-text-in-grid")
            .forEach((chairText) => {
                const isStack = chairText.textContent.startsWith("S");
                const isCChair = chairText.textContent.startsWith("C");
                let currentNumber;

                if (isStack) {
                    currentNumber = parseInt(
                        chairText.textContent.substring(1)
                    );
                } else if (isCChair) {
                    currentNumber = parseInt(
                        chairText.textContent.match(/\(S(\d+)\)/)[1]
                    );
                }

                // Renumber chairs
                if (currentNumber > stackNumber) {
                    const newNumber = currentNumber - 1;
                    const newText = isStack
                        ? `S${newNumber}`
                        : chairText.textContent.replace(
                              `S${currentNumber}`,
                              `S${newNumber}`
                          );
                    chairText.textContent = newText;

                    // Update allocatedCNumbersByStack for C chairs
                    if (isCChair) {
                        if (
                            allocatedCNumbersByStack[`S${newNumber}`] ===
                            undefined
                        ) {
                            allocatedCNumbersByStack[`S${newNumber}`] =
                                allocatedCNumbersByStack[`S${currentNumber}`];
                            delete allocatedCNumbersByStack[
                                `S${currentNumber}`
                            ];
                        }
                    }
                }
            });

        // Update allocatedNumbers set
        allocatedNumbers.delete(stackNumber);
        const updatedNumbers = new Set(
            [...allocatedNumbers].map((num) =>
                num > stackNumber ? num - 1 : num
            )
        );
        allocatedNumbers.clear();
        updatedNumbers.forEach((num) => allocatedNumbers.add(num));
    } else if (chairTextContent.startsWith("C")) {
        // Deleting a C chair, remove it individually
        // Parse the stack ID and C number from the chair's text
        const match = chairTextContent.match(/C(\d+) \(S(\d+)\)/);
        if (match) {
            const stackId = `S${match[2]}`;
            gridItem.removeChild(chairContainer);
            // Decrement the count since we're removing a C chair
            if (allocatedCNumbersByStack[stackId] > 0) {
                allocatedCNumbersByStack[stackId]--;
            }

            let currentNumber = 1;
            document
                .querySelectorAll(`.chair-text-in-grid`)
                .forEach((element) => {
                    if (element.textContent.includes(`(${stackId})`)) {
                        element.textContent = `C${currentNumber++} (${stackId})`; // Update C chair number
                    }
                });
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
        // robotImage.draggable = false;
        gridItem.appendChild(robotImage);
    }
}

function toggleHighlight(item) {
    // Check if the item is a stack or C chair and toggle highlight
    const chairText =
        item.querySelector(".chair-text-in-grid")?.textContent || "";
    if (chairText.startsWith("S") || chairText.startsWith("C")) {
        if (
            item.classList.contains("highlighted-yellow") ||
            item.classList.contains("highlighted-blue")
        ) {
            // Unhighlight the stack and associated C chairs
            document
                .querySelectorAll(".highlighted-yellow, .highlighted-blue")
                .forEach((el) =>
                    el.classList.remove(
                        "highlighted-yellow",
                        "highlighted-blue"
                    )
                );
        } else {
            // Clear existing highlights
            document
                .querySelectorAll(".highlighted-yellow, .highlighted-blue")
                .forEach((el) =>
                    el.classList.remove(
                        "highlighted-yellow",
                        "highlighted-blue"
                    )
                );

            if (chairText.startsWith("S")) {
                // Highlight the stack
                item.classList.add("highlighted-yellow");
                // Highlight associated C chairs
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent.includes(`(${chairText})`)) {
                            el.closest(".grid-item").classList.add(
                                "highlighted-blue"
                            );
                        }
                    });
            } else if (chairText.startsWith("C")) {
                // Highlight the C chair
                item.classList.add("highlighted-blue");
                // Extract the stack ID from the C chair text
                const stackId = chairText.match(/\((S\d+)\)/)[1];
                // Highlight the associated stack
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent === stackId) {
                            el.closest(".grid-item").classList.add(
                                "highlighted-yellow"
                            );
                        }
                    });
                // Highlight all C chairs associated with this stack
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent.includes(`(${stackId})`)) {
                            el.closest(".grid-item").classList.add(
                                "highlighted-blue"
                            );
                        }
                    });
            }
        }
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

// const sendData = () => {
//     const gridDataJson = generateGridDataJson();
//     console.log(gridDataJson);

//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", "http://localhost:8082");

//     xhr.responseType = "json";
//     xhr.onload = () => {
//         if (xhr.readyState == 4 && xhr.status == 201) {
//             console.log("no");
//         } else {
//             console.log(`Error: ${xhr.status}`);
//         }
//     };

//     xhr.send(gridDataJson);
//     console.log("Grid JSON data sent to server.");
// };

// document.getElementById("send-json").addEventListener("click", sendData);

const sendData = () => {
    const gridDataJson = generateGridDataJson();
    console.log(gridDataJson);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8082/grid"); // Updated URL

    xhr.responseType = "json";
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) { // Updated status code
            console.log("Success");
        } else {
            console.log(`Error: ${xhr.status}`);
        }
    };

    xhr.send(gridDataJson);
    console.log("Grid JSON data sent to server.");
};

document.getElementById("send-json").addEventListener("click", sendData);

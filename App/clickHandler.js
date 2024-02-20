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

// Add a pointerover event listener to the grid container for the faded chair preview
gridContainer.addEventListener("pointerover", (event) => {
    const gridItem = event.target.closest(".grid-item");
    if (
        !gridItem ||
        gridItem.querySelector(".chair-container-in-grid") ||
        gridItem.classList.contains("black") ||
        gridItem.querySelector(".robot-in-grid")
    ) {
        // Exit if the grid item is invalid, already has a chair, is an obstacle, or has a robot
        return;
    }

    // Remove any existing faded chair previews
    const existingFaded = document.querySelector(".faded");
    if (existingFaded) {
        existingFaded.remove();
    }

    // Depending on the mode, show a faded chair preview
    if (
        currentMode === "stack" ||
        (currentMode === "place" && selectedStack) ||
        (currentMode === "move" && selectedMovingChair)
    ) {
        showFadedChairPreview(gridItem);
    }
});

// Add a pointerout event listener to remove the faded chair preview when the mouse leaves a grid item
gridContainer.addEventListener("pointerout", (event) => {
    const fadedPreview = document.querySelector(".faded");
    if (fadedPreview) {
        fadedPreview.remove();
    }
});

function showFadedChairPreview(gridItem) {
    const container = document.createElement("div");
    container.className = "chair-container-in-grid faded"; // Add 'faded' class for opacity

    // Chair image
    const chairImage = document.createElement("img");
    chairImage.src = "chair.png";
    chairImage.alt = "Chair";
    chairImage.className = "chair-in-grid";

    // Chair text (calculate based on mode)
    const chairText = document.createElement("span");
    chairText.className = "chair-text-in-grid";
    chairText.style.fontSize = `${calculateFontSize(gridSize)}px`;

    if (currentMode === "stack") {
        chairText.textContent = `S?`; // Placeholder text for stack mode
    } else if (currentMode === "place" && selectedStack) {
        chairText.textContent = `C? (${
            selectedStack.querySelector(".chair-text-in-grid").textContent
        })`; // Placeholder text for place mode with selected stack
    } else if (currentMode === "move" && selectedMovingChair) {
        chairText.textContent = selectedMovingChair.querySelector(
            ".chair-text-in-grid"
        ).textContent; // Same text as the selected chair for move mode
    }

    container.append(chairImage, chairText);
    gridItem.appendChild(container);
}

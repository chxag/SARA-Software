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

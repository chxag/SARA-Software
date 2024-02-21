// Used for mouse holding functionality
let lastGridItem;
let isMouseDown = false;
let isQuickClick; // Variable to determine if it's a quick click
let holdTimeoutId; // Variable to store the timeout ID
let hoveredGridItem = null; // Variable to track the chair that was under the mouse during pointerdown

gridContainer.addEventListener("pointerdown", (event) => {
    if (event.button === 0) {
        isMouseDown = true;
        isQuickClick = true;

        if (currentMode === "rotate") {
            // Track the grid item under the mouse during pointerdown
            clickedGridItem = event.target.closest(".grid-item");

            holdTimeoutId = setTimeout(() => {
                if (isMouseDown && clickedGridItem === hoveredGridItem) {
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
    highlightInaccessibleChairs();
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
            if (selectedRotatingChair) {
                selectedRotatingChair.classList.remove("highlighted-yellow");
                selectedRotatingChair = null; // Reset active chair
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
    hoveredGridItem = gridItem;

    if (isMouseDown && gridItem !== lastGridItem) {
        isQuickClick = true;
        handleGridClick(event);
    }

    // Previewing implementation
    if (
        !gridItem ||
        gridItem.querySelector(".chair-container-in-grid") ||
        gridItem.querySelector(".robot-in-grid") ||
        gridItem.classList.contains("black")
    ) {
        // Exit if not hovering over a grid item or if the grid item contains a chair, a robot, or is an obstacle
        return;
    }

    // Clear any previously shown preview chair
    const existingPreview = document.querySelector(".preview-chair-container");
    if (existingPreview) {
        existingPreview.remove();
    }

    // Show a preview chair based on the current mode
    if (currentMode === "stack") {
        const previewChairContainer = createPreviewChair();
        gridItem.appendChild(previewChairContainer);
    } else if (currentMode === "move" && selectedMovingChair) {
        // Get the rotation degree of the selected moving chair
        const selectedChairImage =
            selectedMovingChair.querySelector(".chair-in-grid");
        const rotationDegree = selectedChairImage
            ? parseInt(selectedChairImage.dataset.rotation) || 0
            : defaultRotationDegree;

        const previewChairContainer = createPreviewChair(rotationDegree);
        gridItem.appendChild(previewChairContainer);
    } else if (currentMode === "place" && selectedStack) {
        const stackText = selectedStack.querySelector(
            ".chair-text-in-grid"
        ).textContent; // e.g., "S1"
        if (
            allocatedCNumbersByStack[stackText] < maxChairsPerStack ||
            allocatedCNumbersByStack[stackText] === undefined
        ) {
            const previewChairContainer = createPreviewChair();
            gridItem.appendChild(previewChairContainer);
        }
    }
});

function handleGridClick(event) {
    const gridItem = event.target.closest(".grid-item");
    if (!gridItem) return; // Exit if clicked object is not a grid item

    // Clear any previously shown preview chair
    const existingPreview = document.querySelector(".preview-chair-container");
    if (existingPreview) {
        existingPreview.remove();
    }

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

function createPreviewChair(rotationDegree = defaultRotationDegree) {
    // Create a container for the preview chair
    const container = document.createElement("div");
    container.className = "preview-chair-container";

    const previewChair = document.createElement("img");
    previewChair.src = "chair.png";
    previewChair.alt = "Chair";
    previewChair.className = "preview-chair-in-grid";
    // Apply the given rotation
    previewChair.style.transform = `rotate(${rotationDegree}deg)`;

    // Append the preview chair image to the container
    container.appendChild(previewChair);

    return container;
}

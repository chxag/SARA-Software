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

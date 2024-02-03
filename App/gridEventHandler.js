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

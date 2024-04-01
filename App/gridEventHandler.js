function addStack(gridItem, rotationDegree = defaultRotationDegree) {
    if (!gridItem) return;
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
    chairImage.style.transform = `rotate(${rotationDegree}deg)`; // Apply the default rotation degree
    chairImage.dataset.rotation = rotationDegree;
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

function handlePlaceMode(gridItem, rotationDegree = defaultRotationDegree) {
    if (!gridItem) return;
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");

    // To not get mixed up with stacks
    const isChairContainer = !!chairContainer;
    const isCChair =
        isChairContainer &&
        chairContainer
            .querySelector(".chair-text-in-grid")
            .textContent.startsWith("C");

    // If stack selected already and clicked grid item is not a chair
    if (!isChairContainer) {
        if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
        if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

        if (!selectedStack) {
            alert(
                "Select a stack (add in Stack mode) to place chairs of the selected stack."
            );
            isMouseDown = false; // Reset mouse down status
            clearTimeout(holdTimeoutId);
            return;
        }

        const stackText = selectedStack.querySelector(
            ".chair-text-in-grid"
        ).textContent; // e.g., "S1"
        const cNumber = getLowestAvailableCNumber(stackText); // Get the lowest available C number for this stack

        if (cNumber === null) {
            return;
        }

        // Add C chair associated with the selected stack
        addChair(gridItem, `C${cNumber} (${stackText})`, rotationDegree);

        // Update the counter display
        updateStackCounter(stackText);
    } else if (chairContainer && !isCChair) {
        // Selecting or deselecting a stack
        if (selectedStack === chairContainer) {
            // Deselect if the same stack is clicked again
            selectedStack.classList.remove("highlighted-yellow");
            document.getElementById("stack-counter").style.display = "none"; // Hide the counter
            selectedStack = null;
        } else {
            // Select a new stack
            if (selectedStack)
                selectedStack.classList.remove("highlighted-yellow");
            selectedStack = chairContainer;
            chairContainer.classList.add("highlighted-yellow");

            // Update the counter display
            const stackText = selectedStack.querySelector(
                ".chair-text-in-grid"
            ).textContent;
            updateStackCounter(stackText);
        }
    }
}

function addChair(
    gridItem,
    chairTextContent,
    rotationDegree = defaultRotationDegree
) {
    if (!gridItem) return;
    const container = document.createElement("div");
    container.className = "chair-container-in-grid"; // contains both image and text

    // Chair image
    const chairImage = document.createElement("img");
    chairImage.src = "chair.png";
    chairImage.alt = "Chair";
    chairImage.className = "chair-in-grid";
    chairImage.style.transform = `rotate(${rotationDegree}deg)`; // Apply the default rotation degree
    chairImage.dataset.rotation = rotationDegree;
    // chairImage.draggable = false;

    // Chair text
    const chairText = document.createElement("span");
    chairText.textContent = chairTextContent;
    chairText.className = "chair-text-in-grid";
    chairText.style.fontSize = `${calculateFontSize(gridSize)}px`;

    // Add chair to grid item
    container.append(chairImage, chairText);
    gridItem.appendChild(container);
}

function updateStackCounter(stackId) {
    const stackCounterDiv = document.getElementById("stack-counter");
    const stackCounterId = document.getElementById("stack");
    const stackCounterRemainder = document.getElementById("remainder");

    stackCounterId.textContent = stackId; // Set the stack ID in the counter display

    // Calculate and display the number of remaining chairs for the stack
    const currentCount = allocatedCNumbersByStack[stackId] || 0;
    const remainingChairs = maxChairsPerStack - currentCount;
    stackCounterRemainder.textContent = remainingChairs;

    stackCounterDiv.style.display = "flex"; // Make the counter visible
}

function rotateChair(gridItem, isQuickClick) {
    if (!gridItem) return;
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (!chairContainer) return; // Exit if there's no chair container

    const chairImage = chairContainer.querySelector(".chair-in-grid");
    if (!chairImage) return; // Exit if there's no chair image

    if (isQuickClick) {
        // For a quick click, rotate the chair image by 90 degrees immediately
        rotateByAngle(chairImage, 90);
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

            rotationRange.value = chairImage.dataset.rotation; // Use the rotation value from dataset
            rotationDegree.textContent = `${rotationRange.value}°`;

            rotationRange.oninput = function () {
                rotationDegree.textContent = `${this.value}°`;
                chairImage.style.transform = `rotate(${this.value}deg)`;
                chairImage.dataset.rotation = this.value; // Update rotation in dataset
            };
        } else {
            selectedRotatingChair.classList.remove("highlighted-yellow");
            document.getElementById("rotateControlPanel").style.display =
                "none";
            selectedRotatingChair = null;
        }
    }
}

function rotateByAngle(chairImage, angle) {
    // Extract the current rotation angle from the transform style
    const currentTransform = chairImage.style.transform;
    const rotationMatch = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
    let currentRotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;

    // Calculate the new display rotation, taking overflow past 360 into account
    let newDisplayRotation = currentRotation + angle;

    // Update the dataset rotation to be within the 0-360 range
    let datasetRotation = ((newDisplayRotation % 360) + 360) % 360;
    chairImage.dataset.rotation = datasetRotation;

    // Apply the updated rotation for a smooth transition
    chairImage.style.transform = `rotate(${newDisplayRotation}deg)`;

    if (selectedRotatingChair) {
        selectedRotatingChair.classList.remove("highlighted-yellow");
        selectedRotatingChair = null;
    }
    document.getElementById("rotateControlPanel").style.display = "none";
}

document.addEventListener("keydown", function (event) {
    const existingPreview = document.querySelector(".preview-chair-container");
    if (currentMode === "stack" || currentMode === "place") {
        if (!existingPreview) return;
        switch (event.key.toLowerCase()) {
            case "q":
                defaultRotationDegree =
                    (((defaultRotationDegree - 90) % 360) + 360) % 360;
                break;
            case "w":
                defaultRotationDegree =
                    (((defaultRotationDegree - 10) % 360) + 360) % 360;
                break;
            case "e":
                defaultRotationDegree =
                    (((defaultRotationDegree + 10) % 360) + 360) % 360;
                break;
            case "r":
                defaultRotationDegree =
                    (((defaultRotationDegree + 90) % 360) + 360) % 360;
                break;
            case "t":
                defaultRotationDegree =
                    (((defaultRotationDegree - 180) % 360) + 360) % 360;
                break;
        }
        previewChair(hoveredGridItem);
    } else if (currentMode === "rotate" && hoveredGridItem) {
        const chairContainer = hoveredGridItem.querySelector(
            ".chair-container-in-grid"
        );
        if (!chairContainer) return;

        const chairImage = chairContainer.querySelector(".chair-in-grid");
        if (!chairImage) return;

        switch (event.key.toLowerCase()) {
            case "q":
                rotateByAngle(chairImage, -90);
                break;
            case "w":
                rotateByAngle(chairImage, -10);
                break;
            case "e":
                rotateByAngle(chairImage, 10);
                break;
            case "r":
                rotateByAngle(chairImage, 90);
                break;
            case "t":
                rotateByAngle(chairImage, -180);
                break;
        }
        highlightInaccessibleChairs();
    }
});

function moveChair(gridItem) {
    if (!gridItem) return;
    const chairContainer = gridItem.querySelector(".chair-container-in-grid");
    if (isMultiSelectEnabled) {
        if (
            chairContainer &&
            !chairContainer.classList.contains("highlighted-yellow")
        ) {
            chairContainer.classList.add("highlighted-yellow");
        } else if (
            chairContainer &&
            chairContainer.classList.contains("highlighted-yellow")
        ) {
            chairContainer.classList.remove("highlighted-yellow");
        }
    } else {
        if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot
        if (gridItem.classList.contains("black")) return; // Skip if there's an obstacle

        const chairContainer = gridItem.querySelector(
            ".chair-container-in-grid"
        );

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
        } else if (selectedMovingChair) {
            selectedMovingChair.classList.remove("highlighted-yellow");
            selectedMovingChair = null;
        }
    }
}

document.addEventListener("keydown", function (event) {
    if (currentMode === "move") {
        if (event.key.toLowerCase() === "e") toggleSelectMode();
        if (event.key.toLowerCase() === "q") {
            // Clear any multi-selection
            const selectedChairs = Array.from(
                document.querySelectorAll(".highlighted-yellow")
            );
            selectedChairs.forEach((chair) =>
                chair.classList.remove("highlighted-yellow")
            );
            selectedMovingChair = null;

            const existingPreview = document.querySelector(
                ".preview-chair-container"
            );
            const existingRobotPreview = document.querySelector(
                ".preview-robot-in-grid"
            );
            if (existingPreview) existingPreview.remove();
            if (existingRobotPreview) existingRobotPreview.remove();
        }
    }
});

document
    .getElementById("toggleSelectMode")
    .addEventListener("click", toggleSelectMode);

let isMultiSelectEnabled = false;

function toggleSelectMode() {
    isMultiSelectEnabled = !isMultiSelectEnabled;
    document.getElementById("toggleSelectMode").textContent =
        isMultiSelectEnabled
            ? "Switch to Single-Select"
            : "Switch to Multi-Select";
    if (!isMultiSelectEnabled) {
        // Clear any multi-selection
        const selectedChairs = Array.from(
            document.querySelectorAll(".highlighted-yellow")
        );
        selectedChairs.forEach((chair) =>
            chair.classList.remove("highlighted-yellow")
        );
    }
}

document.addEventListener("keydown", function (event) {
    // Handling movement through keyboard inputs when in move mode and multi-select is enabled
    if (currentMode === "move") {
        switch (
            event.key.toLowerCase() // Use toLowerCase() for simplicity
        ) {
            case "w":
            case "arrowup":
                moveSelectedChairs("up");
                event.preventDefault(); // Prevent default action (scrolling) when pressing arrow keys
                break;
            case "s":
            case "arrowdown":
                moveSelectedChairs("down");
                event.preventDefault();
                break;
            case "a":
            case "arrowleft":
                moveSelectedChairs("left");
                event.preventDefault();
                break;
            case "d":
            case "arrowright":
                moveSelectedChairs("right");
                event.preventDefault();
                break;
        }
    }
});

// Adding event listeners for the movement buttons
document
    .getElementById("moveUp")
    .addEventListener("click", () => moveSelectedChairs("up"));
document
    .getElementById("moveDown")
    .addEventListener("click", () => moveSelectedChairs("down"));
document
    .getElementById("moveLeft")
    .addEventListener("click", () => moveSelectedChairs("left"));
document
    .getElementById("moveRight")
    .addEventListener("click", () => moveSelectedChairs("right"));

function moveSelectedChairs(direction) {
    const selectedChairs = Array.from(
        document.querySelectorAll(".highlighted-yellow")
    );
    let moveAttempts = new Map();
    let cancellations = new Set();

    // Prepare move attempts
    selectedChairs.forEach((chair) => {
        const currentId = chair.parentElement.id;
        const [prefix, row, col] = currentId.split("-");
        let [targetRow, targetCol] = [parseInt(row), parseInt(col)];

        switch (direction) {
            case "up":
                targetRow--;
                break;
            case "down":
                targetRow++;
                break;
            case "left":
                targetCol--;
                break;
            case "right":
                targetCol++;
                break;
        }

        const targetId = `item-${targetRow}-${targetCol}`;
        moveAttempts.set(chair, { currentId, targetId });
    });

    // Validate moves
    moveAttempts.forEach(({ targetId }, chair) => {
        const targetCell = document.getElementById(targetId);
        if (
            !targetCell ||
            targetCell.classList.contains("black") ||
            targetCell.querySelector(".robot-in-grid")
        ) {
            cancellations.add(chair);
        } else {
            const targetChair = targetCell.querySelector(
                ".chair-container-in-grid"
            );
            if (targetChair && !selectedChairs.includes(targetChair)) {
                cancellations.add(chair);
            }
        }
    });

    let revalidationNeeded;
    do {
        revalidationNeeded = false;
        moveAttempts.forEach(({ targetId }, chair) => {
            if (cancellations.has(chair)) return; // Skip cancelled moves

            // Check if the target cell is the start cell of a cancelled move
            for (let cancelledChair of cancellations) {
                if (moveAttempts.get(cancelledChair).currentId === targetId) {
                    cancellations.add(chair); // Cancel this move as well
                    revalidationNeeded = true;
                    break;
                }
            }
        });
    } while (revalidationNeeded);

    // Execute valid moves
    moveAttempts.forEach(({ targetId }, chair) => {
        if (!cancellations.has(chair)) {
            const targetCell = document.getElementById(targetId);
            // Check and remove any existing preview chair in the target cell
            const previewChair = targetCell.querySelector(
                ".preview-chair-container"
            );
            if (previewChair) {
                targetCell.removeChild(previewChair);
            }
            targetCell.appendChild(chair);
        }
    });

    highlightInaccessibleChairs();
}

function deleteChair(gridItem) {
    if (!gridItem) return;
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
    if (!gridItem) return;
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

function addOrRemoveObstacle(gridItem) {
    if (!gridItem) return;
    if (gridItem.querySelector(".chair-container-in-grid")) return; // Skip if there's a chair
    if (gridItem.querySelector(".robot-in-grid")) return; // Skip if there's a robot

    if (gridItem.classList.contains("black")) {
        gridItem.classList.remove("black");
    } else {
        gridItem.classList.add("black");
    }
}

function toggleHighlight(item) {
    // Check if the item is a stack or C chair and toggle highlight
    const chairContainer = item.querySelector(".chair-container-in-grid");
    const chairText =
        chairContainer?.querySelector(".chair-text-in-grid")?.textContent || "";

    if (chairText.startsWith("S") || chairText.startsWith("C")) {
        if (
            chairContainer.classList.contains("highlighted-yellow") ||
            chairContainer.classList.contains("highlighted-blue")
        ) {
            // Unhighlight the stack and associated C chairs
            document
                .querySelectorAll(
                    ".chair-container-in-grid.highlighted-yellow, .chair-container-in-grid.highlighted-blue"
                )
                .forEach((el) =>
                    el.classList.remove(
                        "highlighted-yellow",
                        "highlighted-blue"
                    )
                );
        } else {
            // Clear existing highlights
            document
                .querySelectorAll(
                    ".chair-container-in-grid.highlighted-yellow, .chair-container-in-grid.highlighted-blue"
                )
                .forEach((el) =>
                    el.classList.remove(
                        "highlighted-yellow",
                        "highlighted-blue"
                    )
                );

            if (chairText.startsWith("S")) {
                // Highlight the stack
                chairContainer.classList.add("highlighted-yellow");
                // Highlight associated C chairs
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent.includes(`(${chairText})`)) {
                            el.closest(
                                ".chair-container-in-grid"
                            ).classList.add("highlighted-blue");
                        }
                    });
            } else if (chairText.startsWith("C")) {
                // Highlight the C chair
                chairContainer.classList.add("highlighted-blue");
                // Extract the stack ID from the C chair text
                const stackId = chairText.match(/\((S\d+)\)/)[1];
                // Highlight the associated stack
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent === stackId) {
                            el.closest(
                                ".chair-container-in-grid"
                            ).classList.add("highlighted-yellow");
                        }
                    });
                // Highlight all C chairs associated with this stack
                document
                    .querySelectorAll(
                        ".chair-container-in-grid .chair-text-in-grid"
                    )
                    .forEach((el) => {
                        if (el.textContent.includes(`(${stackId})`)) {
                            el.closest(
                                ".chair-container-in-grid"
                            ).classList.add("highlighted-blue");
                        }
                    });
            }
        }
    }
}

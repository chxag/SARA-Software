const layoutTitle = document.getElementById("layoutTitle");
const roomStateLabel = document.getElementById("roomStateLabel");
const roomStateValue = document.getElementById("roomStateValue");
const initiateRobotButton = document.getElementById("initiateRobot");

function displayLayoutData() {
    urlParams = new URLSearchParams(window.location.search);
    layoutName = urlParams.get("layoutName");

    if (layoutName && localStorage.getItem(layoutName) != null) {
        try {
            const layoutDataJson = localStorage.getItem(layoutName);
            const layoutData = JSON.parse(layoutDataJson);

            layoutTitle.textContent = decodeURIComponent(layoutName);
            roomStateLabel.style.display = "block";

            if (layoutData.stacked) {
                roomStateValue.textContent = "Stacked";
                initiateRobotButton.textContent =
                    "Initiate Robot - Arrange Chairs";
                greyOutChairs(true); // Grey out C chairs
            } else {
                roomStateValue.textContent = "Unstacked";
                initiateRobotButton.textContent =
                    "Initiate Robot - Stack Chairs";
                greyOutChairs(false); // Grey out stacks
            }

            initiateRobotButton.classList.remove("grey-out");
        } catch (e) {}
    }
}

// Function to grey out chairs based on the room state
function greyOutChairs(isRoomStacked) {
    const chairContainers = document.querySelectorAll(
        ".chair-container-in-grid"
    );

    chairContainers.forEach((container) => {
        const isCChair = container
            .querySelector(".chair-text-in-grid")
            .textContent.startsWith("C");
        const chairImage = container.querySelector(".chair-in-grid");

        if (isRoomStacked && isCChair) {
            // Room is stacked, grey out C chairs
            chairImage.classList.add("grey-out");
        } else if (!isRoomStacked && !isCChair) {
            // Room is unstacked, grey out stacks
            chairImage.classList.add("grey-out");
        } else {
            // Otherwise, remove grey-out class
            chairImage.classList.remove("grey-out");
        }
    });
}

function saveCurrentLayout() {
    const gridDataJson = generateGridDataJson();

    // Check if a layout name is provided in the URL
    const urlParams = new URLSearchParams(window.location.search);
    let layoutName = urlParams.get("layoutName");

    if (layoutName) {
        // Ask the user if they want to overwrite the current layout
        const overwrite = confirm(
            `Do you want to overwrite the current layout '${layoutName}'?`
        );
        if (!overwrite) {
            // If the user doesn't want to overwrite, prompt for a new name
            layoutName = prompt("Enter a new name for this layout:");
        }
    } else {
        // If no layout name in the URL, prompt for a name
        const tempName = prompt("Enter a name for this layout:");

        if (localStorage.getItem(tempName) !== null) {
            // Prompt the user to confirm overwriting the existing layout
            const overwrite = confirm(
                `The layout '${tempName}' already exists. Do you want to overwrite it?`
            );
            if (!overwrite) {
                // If the user chooses not to overwrite, exit the function
                return;
            }
        }
        layoutName = tempName;
    }

    if (layoutName) {
        // Save layout in localStorage
        localStorage.setItem(layoutName, gridDataJson);

        localStorage.setItem("mostRecentGrid", gridDataJson); // Store the most recent grid JSON
        localStorage.setItem("previousLayout", layoutName);

        alert("Layout saved successfully.");

        // Update the layoutName variable with the new name
        // This ensures the displayLayoutData function uses the updated name
        window.layoutName = layoutName;

        // Optionally, update the URL to reflect the new/current layout name
        window.history.replaceState(
            null,
            "",
            `?layoutName=${encodeURIComponent(layoutName)}`
        );
        document.title = `${layoutName} - SARA`;

        displayLayoutData();
    }
}

// Assuming there's a button in your HTML for saving the layout
document
    .getElementById("save-layout")
    .addEventListener("click", saveCurrentLayout);

function clearLayout() {
    if (currentMode != null) toggleMode(currentMode);
    const chairContainers = document.querySelectorAll(
        ".chair-container-in-grid"
    );
    chairContainers.forEach((container) => container.remove());

    const robots = document.querySelectorAll(".robot-in-grid");
    robots.forEach((robot) => robot.remove());

    allocatedNumbers.clear();
    defaultRotationDegree = 0;
    Object.keys(allocatedCNumbersByStack).forEach((key) => {
        delete allocatedCNumbersByStack[key];
    });
}

document.getElementById("clear-layout").addEventListener("click", () => {
    const prompt = confirm("Are you sure you want to clear the layout?");
    if (!prompt) {
        return;
    }
    clearLayout();
});

document.getElementById("rotate-layout").addEventListener("click", () => {
    const prompt = confirm("Are you sure you want to rotate the layout?");
    if (!prompt) {
        return;
    }

    // Generate the current layout's JSON
    const currentLayoutJson = generateGridDataJson();

    // Rotate the layout
    const rotatedLayoutJson = rotateLayout(currentLayoutJson);

    // Clear the current layout, including removing chairs, stacks, and the robot
    clearLayout();

    gridContainer.innerHTML = ""; // Clear existing grid items

    // Re-create the grid based on the rotated layout JSON
    createSavedGrid(rotatedLayoutJson);

    // Ensure any UI updates or additional logic that needs to run after rotating the layout
    displayLayoutData();

    updateGridCentering();
});

function rotateLayout(gridDataJson) {
    if (currentMode != null) toggleMode(currentMode);

    const gridData = JSON.parse(gridDataJson);

    // Swap dimensions
    const newRows = gridData.dimensions.columns;
    const newColumns = gridData.dimensions.rows;

    // Initialize new grid data with rotated dimensions
    const newGridData = {
        dimensions: { rows: newRows, columns: newColumns },
        robot: null, // We'll calculate the new robot position
        stacks: [],
        obstacles: [],
    };

    // Rotate robot position if it exists
    if (gridData.robot) {
        const [robotRow, robotColumn] = gridData.robot.split("-").map(Number);
        const newRobotRow = robotColumn;
        const newRobotColumn = gridData.dimensions.rows - robotRow + 1;
        newGridData.robot = `${newRobotRow}-${newRobotColumn}`;
    }

    // Rotate stacks and chairs
    gridData.stacks.forEach((stack) => {
        const [stackRow, stackColumn] = stack.location.split("-").map(Number);
        const newStackRow = stackColumn;
        const newStackColumn = gridData.dimensions.rows - stackRow + 1;
        const newStackRotation = (stack.rotation + 90) % 360;

        const newStack = {
            location: `${newStackRow}-${newStackColumn}`,
            rotation: newStackRotation,
            chairs: [],
        };

        // Rotate chairs within the stack
        stack.chairs.forEach((chair) => {
            const [chairRow, chairColumn] = chair.location
                .split("-")
                .map(Number);
            const newChairRow = chairColumn;
            const newChairColumn = gridData.dimensions.rows - chairRow + 1;
            const newChairRotation = (chair.rotation + 90) % 360;

            newStack.chairs.push({
                location: `${newChairRow}-${newChairColumn}`,
                rotation: newChairRotation,
            });
        });

        newGridData.stacks.push(newStack);
    });

    // Rotate obstacles
    gridData.obstacles.forEach((obstacle) => {
        const [obstacleRow, obstacleColumn] = obstacle.split("-").map(Number);
        const newObstacleRow = obstacleColumn;
        const newObstacleColumn = gridData.dimensions.rows - obstacleRow + 1;

        newGridData.obstacles.push(`${newObstacleRow}-${newObstacleColumn}`);
    });

    return JSON.stringify(newGridData);
}

document
    .getElementById("add-row-top")
    .addEventListener("click", () => addRow("top"));
document
    .getElementById("remove-row-top")
    .addEventListener("click", () => removeRow("top"));
document
    .getElementById("add-col-left")
    .addEventListener("click", () => addColumn("left"));
document
    .getElementById("remove-col-left")
    .addEventListener("click", () => removeColumn("left"));
document
    .getElementById("add-row-bottom")
    .addEventListener("click", () => addRow("bottom"));
document
    .getElementById("remove-row-bottom")
    .addEventListener("click", () => removeRow("bottom"));
document
    .getElementById("add-col-right")
    .addEventListener("click", () => addColumn("right"));
document
    .getElementById("remove-col-right")
    .addEventListener("click", () => removeColumn("right"));

function addRow(position) {
    const gridDataJson = generateGridDataJson(); // Get current layout JSON
    let gridData = JSON.parse(gridDataJson);

    gridData.dimensions.rows += 1; // Increment total rows count

    if (position === "top") {
        // Increment the row index of stacks, obstacles, and robot to make space at the top
        gridData = adjustLayoutForAddition(gridData, "row");
    }

    // Clear the layout and recreate the grid with updated dimensions
    clearLayout();
    gridContainer.innerHTML = ""; // Clear existing grid items
    createSavedGrid(JSON.stringify(gridData));
}

function addColumn(position) {
    const gridDataJson = generateGridDataJson(); // Get current layout JSON
    let gridData = JSON.parse(gridDataJson);

    gridData.dimensions.columns += 1; // Increment total columns count

    if (position === "left") {
        // Increment the column index of stacks, obstacles, and robot to make space on the left
        gridData = adjustLayoutForAddition(gridData, "column");
    }

    // Clear the layout and recreate the grid with updated dimensions
    clearLayout();
    gridContainer.innerHTML = ""; // Clear existing grid items
    createSavedGrid(JSON.stringify(gridData));
}

function adjustLayoutForAddition(gridData, type) {
    if (type === "row") {
        // Increment row index for stacks, obstacles, robot, and each chair in the stacks
        gridData.stacks.forEach((stack) => {
            stack.location = incrementIndex(stack.location, "row");
            stack.chairs.forEach((chair) => {
                chair.location = incrementIndex(chair.location, "row");
            });
        });
        gridData.obstacles = gridData.obstacles.map((obstacle) =>
            incrementIndex(obstacle, "row")
        );
        if (gridData.robot)
            gridData.robot = incrementIndex(gridData.robot, "row");
    } else if (type === "column") {
        // Increment column index for stacks, obstacles, robot, and each chair in the stacks
        gridData.stacks.forEach((stack) => {
            stack.location = incrementIndex(stack.location, "column");
            stack.chairs.forEach((chair) => {
                chair.location = incrementIndex(chair.location, "column");
            });
        });
        gridData.obstacles = gridData.obstacles.map((obstacle) =>
            incrementIndex(obstacle, "column")
        );
        if (gridData.robot)
            gridData.robot = incrementIndex(gridData.robot, "column");
    }

    return gridData;
}

function incrementIndex(location, type) {
    let [row, column] = location.split("-").map(Number);
    if (type === "row") {
        row += 1; // Increment the row index
    } else if (type === "column") {
        column += 1; // Increment the column index
    }
    return `${row}-${column}`;
}

function removeRow(position) {
    const gridDataJson = generateGridDataJson();
    let gridData = JSON.parse(gridDataJson);

    if (gridData.dimensions.rows > 1) {
        let occupied = isRowOccupied(
            gridData,
            position === "top" ? 1 : gridData.dimensions.rows
        );
        if (
            occupied &&
            !confirm(
                "This row is occupied, are you sure you want to remove it?"
            )
        ) {
            return;
        }

        if (position === "top") {
            gridData = adjustLayoutForRemoval(gridData, "row", 1, true);
        } else if (position === "bottom") {
            gridData = adjustLayoutForRemoval(
                gridData,
                "row",
                gridData.dimensions.rows,
                false
            );
        }

        gridData.dimensions.rows -= 1;
        recreateGrid(gridData);
    }
}

function removeColumn(position) {
    const gridDataJson = generateGridDataJson();
    let gridData = JSON.parse(gridDataJson);

    if (gridData.dimensions.columns > 1) {
        let occupied = isColumnOccupied(
            gridData,
            position === "left" ? 1 : gridData.dimensions.columns
        );
        if (
            occupied &&
            !confirm(
                "This column is occupied, are you sure you want to remove it?"
            )
        ) {
            return;
        }

        if (position === "left") {
            gridData = adjustLayoutForRemoval(gridData, "column", 1, true);
        } else if (position === "right") {
            gridData = adjustLayoutForRemoval(
                gridData,
                "column",
                gridData.dimensions.columns,
                false
            );
        }

        gridData.dimensions.columns -= 1;
        recreateGrid(gridData);
    }
}

function isRowOccupied(gridData, rowIndex) {
    // Check for stacks and their chairs in the specified row
    const isStackOrChairInRow = gridData.stacks.some((stack) => {
        const stackRow = getRow(stack.location);
        // Check if the stack itself is in the specified row
        if (stackRow === rowIndex) return true;
        // Check if any of the stack's chairs are in the specified row
        return stack.chairs.some(
            (chair) => getRow(chair.location) === rowIndex
        );
    });

    // Check for obstacles in the specified row
    const isObstacleInRow = gridData.obstacles.some(
        (obstacle) => getRow(obstacle) === rowIndex
    );

    // Check if the robot is in the specified row
    const isRobotInRow = gridData.robot && getRow(gridData.robot) === rowIndex;

    // The row is occupied if any condition above is true
    return isStackOrChairInRow || isObstacleInRow || isRobotInRow;
}

function isColumnOccupied(gridData, columnIndex) {
    // Check for stacks and their chairs in the specified column
    const isStackOrChairInColumn = gridData.stacks.some((stack) => {
        const stackColumn = getColumn(stack.location);
        // Check if the stack itself is in the specified column
        if (stackColumn === columnIndex) return true;
        // Check if any of the stack's chairs are in the specified column
        return stack.chairs.some(
            (chair) => getColumn(chair.location) === columnIndex
        );
    });

    // Check for obstacles in the specified column
    const isObstacleInColumn = gridData.obstacles.some(
        (obstacle) => getColumn(obstacle) === columnIndex
    );

    // Check if the robot is in the specified column
    const isRobotInColumn =
        gridData.robot && getColumn(gridData.robot) === columnIndex;

    // The column is occupied if any condition above is true
    return isStackOrChairInColumn || isObstacleInColumn || isRobotInColumn;
}

function recreateGrid(gridData) {
    clearLayout(); // Clear existing grid items and related states
    gridContainer.innerHTML = "";
    createSavedGrid(JSON.stringify(gridData)); // Use updated grid data to recreate the grid
    displayLayoutData(); // Update UI to reflect changes
}

function adjustLayoutForRemoval(gridData, type, index, adjustIndices) {
    if (type === "row") {
        if (adjustIndices) {
            // Adjusting for removal of the top row
            gridData.stacks.forEach((stack) => {
                // Remove chairs located in the first row from this stack
                stack.chairs = stack.chairs.filter(
                    (chair) => getRow(chair.location) !== 1
                );

                // Decrement the row index for remaining chairs in this stack
                stack.chairs.forEach((chair) => {
                    chair.location = decrementIndex(chair.location, "row");
                });
            });
            gridData.stacks = gridData.stacks
                .filter((stack) => getRow(stack.location) !== 1)
                .map((stack) => {
                    stack.location = decrementIndex(stack.location, "row");
                    return stack;
                });
            gridData.obstacles = gridData.obstacles
                .filter((obstacle) => getRow(obstacle) !== 1)
                .map((obstacle) => decrementIndex(obstacle, "row"));
            if (gridData.robot && getRow(gridData.robot) === 1)
                gridData.robot = null;
            else if (gridData.robot)
                gridData.robot = decrementIndex(gridData.robot, "row");
        } else {
            // Simply remove elements from the last row, no decrement needed
            gridData.stacks = gridData.stacks.filter(
                (stack) => getRow(stack.location) !== index
            );
            gridData.obstacles = gridData.obstacles.filter(
                (obstacle) => getRow(obstacle) !== index
            );
            if (gridData.robot && getRow(gridData.robot) === index)
                gridData.robot = null;
        }
    } else if (type === "column") {
        if (adjustIndices) {
            // Adjusting for removal of the leftmost column
            gridData.stacks.forEach((stack) => {
                // Remove chairs located in the first column from this stack
                stack.chairs = stack.chairs.filter(
                    (chair) => getColumn(chair.location) !== 1
                );

                // Decrement the column index for remaining chairs in this stack
                stack.chairs.forEach((chair) => {
                    chair.location = decrementIndex(chair.location, "column");
                });
            });
            gridData.stacks = gridData.stacks
                .filter((stack) => getColumn(stack.location) !== 1)
                .map((stack) => {
                    stack.location = decrementIndex(stack.location, "column");
                    return stack;
                });
            gridData.obstacles = gridData.obstacles
                .filter((obstacle) => getColumn(obstacle) !== 1)
                .map((obstacle) => decrementIndex(obstacle, "column"));
            if (gridData.robot && getColumn(gridData.robot) === 1)
                gridData.robot = null;
            else if (gridData.robot)
                gridData.robot = decrementIndex(gridData.robot, "column");
        } else {
            // Simply remove elements from the last column, no decrement needed
            gridData.stacks = gridData.stacks.filter(
                (stack) => getColumn(stack.location) !== index
            );
            gridData.obstacles = gridData.obstacles.filter(
                (obstacle) => getColumn(obstacle) !== index
            );
            if (gridData.robot && getColumn(gridData.robot) === index)
                gridData.robot = null;
        }
    }

    return gridData;
}

function decrementIndex(location, type) {
    let [row, column] = location.split("-").map(Number);
    if (type === "row" && row > 1) {
        row -= 1; // Decrement row index only if it's greater than 1
    } else if (type === "column" && column > 1) {
        column -= 1; // Decrement column index only if it's greater than 1
    }
    return `${row}-${column}`;
}

function getRow(location) {
    return location ? parseInt(location.split("-")[0], 10) : null;
}

function getColumn(location) {
    return location ? parseInt(location.split("-")[1], 10) : null;
}

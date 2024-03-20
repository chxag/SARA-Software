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

        displayLayoutData();
    }
}

// Assuming there's a button in your HTML for saving the layout
document
    .getElementById("save-layout")
    .addEventListener("click", saveCurrentLayout);

function clearLayout() {
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
    // Generate the current layout's JSON
    const currentLayoutJson = generateGridDataJson();

    // Rotate the layout
    const rotatedLayoutJson = rotateLayout(currentLayoutJson);

    // Clear the current layout, including removing chairs, stacks, and the robot
    clearLayout();

    const gridContainer = document.querySelector(".grid-container");
    gridContainer.innerHTML = ""; // Clear existing grid items

    // Re-create the grid based on the rotated layout JSON
    createSavedGrid(rotatedLayoutJson);

    // Ensure any UI updates or additional logic that needs to run after rotating the layout
    displayLayoutData();
});

function rotateLayout(gridDataJson) {
    const gridData = JSON.parse(gridDataJson);

    // Swap dimensions
    const newRows = gridData.dimensions.columns;
    const newColumns = gridData.dimensions.rows;

    // Initialize new grid data with rotated dimensions and robot position
    const newGridData = {
        dimensions: { rows: newRows, columns: newColumns },
        robot: gridData.robot, // Robot position remains the same
        stacks: [],
        obstacles: [],
    };

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

const layoutTitle = document.getElementById("layoutTitle");
const roomStateLabel = document.getElementById("roomStateLabel");
const roomStateValue = document.getElementById("roomStateValue");
const initiateRobotButton = document.getElementById("initiateRobot");

displayLayoutData();

function displayLayoutData() {
    urlParams = new URLSearchParams(window.location.search);
    layoutName = urlParams.get("layoutName");

    // Check if there's a layout name in the URL
    console.log;
    if (layoutName && localStorage.getItem(layoutName) != null) {
        const layoutDataJson = localStorage.getItem(layoutName);
        const layoutData = JSON.parse(layoutDataJson);

        layoutTitle.textContent = decodeURIComponent(layoutName);
        roomStateLabel.style.display = "block";

        // Check the 'stacked' property from the layout data to set the room state
        if (layoutData.stacked) {
            roomStateValue.textContent = "Stacked";
            initiateRobotButton.textContent = "Initiate Robot - Arrange Chairs";
        } else {
            roomStateValue.textContent = "Unstacked";
            initiateRobotButton.textContent = "Initiate Robot - Stack Chairs";
        }

        initiateRobotButton.disabled = false; // Enable the button
    }
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
        } // If the user confirms overwrite, proceed without prompting
    } else {
        // If no layout name in the URL, prompt for a name
        layoutName = prompt("Enter a name for this layout:");
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

document.getElementById("clear-layout").addEventListener("click", clearLayout);

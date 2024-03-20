// layouts.js
document.addEventListener("DOMContentLoaded", function () {
    const layoutContainer = document.getElementById("saved-layouts");

    // Retrieve all keys from localStorage and sort them alphabetically
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
    }
    keys.sort();

    // Iterate over sorted keys
    keys.forEach((key) => {
        const value = localStorage.getItem(key);

        try {
            // Attempt to parse the item value as JSON
            const parsed = JSON.parse(value);

            // If parsing was successful and the result is an object (to further ensure it's JSON-like)
            if (typeof parsed === "object" && parsed !== null) {
                // Create a div to hold the layout buttons and action buttons
                const layoutDiv = document.createElement("div");
                layoutDiv.classList.add("layout-item");

                // Create Load button for the layout
                const loadButton = document.createElement("button");
                loadButton.classList.add("load-button");
                loadButton.style.maxWidth = "80%";
                loadButton.style.overflow = "hidden";
                loadButton.style.whiteSpace = "nowrap";

                // Create a span element to hold the button text
                const buttonText = document.createElement("span");
                buttonText.style.overflow = "hidden";
                buttonText.style.textOverflow = "ellipsis";
                buttonText.style.display = "inline-block";
                buttonText.style.maxWidth = "100%"; // Ensure the span takes up the maximum width it can
                buttonText.textContent = key;

                // Append the span to the button
                loadButton.appendChild(buttonText);

                loadButton.onclick = function () {
                    window.location.href = `index.html?layoutName=${encodeURIComponent(
                        key
                    )}`;
                };

                // Create Delete button with Trash Icon for the layout
                const deleteButton = document.createElement("button");
                deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg>`;
                deleteButton.onclick = function () {
                    if (
                        confirm(
                            `Are you sure you want to delete the layout "${key}"?`
                        )
                    ) {
                        localStorage.removeItem(key);
                        layoutDiv.remove(); // Remove the layout div from the page
                    }
                };

                // Create Rename button with Edit Icon for the layout
                const renameButton = document.createElement("button");
                renameButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>`;
                renameButton.onclick = function () {
                    const newName = prompt(
                        "Enter a new name for this layout:",
                        key
                    );
                    if (newName && newName !== key) {
                        localStorage.setItem(newName, value); // Save layout with new name
                        localStorage.removeItem(key); // Remove old layout
                        window.location.reload(); // Reload the page to reflect changes
                    }
                };

                // Create Copy button with Copy Icon for the layout
                const copyButton = document.createElement("button");
                copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
</svg>`;
                copyButton.onclick = function () {
                    // Use the Clipboard API to write the layout JSON string to the clipboard
                    navigator.clipboard.writeText(value).then(
                        () => {
                            alert("JSON data for layout copied to clipboard!");
                        },
                        (err) => {
                            console.error("Could not copy text: ", err);
                        }
                    );
                };

                // Append buttons to the layout div
                layoutDiv.appendChild(deleteButton);
                layoutDiv.appendChild(loadButton);
                layoutDiv.appendChild(renameButton);
                layoutDiv.appendChild(copyButton);

                // Append the layout div to the container
                layoutContainer.appendChild(layoutDiv);
            }
        } catch (e) {
            // Parsing failed, the item value is not JSON, so ignore this item
        }
    });
});

document.getElementById("generateLayout").addEventListener("click", () => {
    let errorMessage = "";

    const rows = parseInt(document.getElementById("rows").value);
    const columns = parseInt(document.getElementById("columns").value);
    const numRows = parseInt(document.getElementById("numRows").value);
    const chairsPerRow = parseInt(
        document.getElementById("chairsPerRow").value
    );
    const aisleGap = parseInt(document.getElementById("aisleGap").value);
    const rowGap = parseInt(document.getElementById("rowGap").value);

    // Validation for non-negative and non-empty inputs
    if (
        !rows ||
        !columns ||
        !numRows ||
        !chairsPerRow ||
        !aisleGap ||
        !rowGap
    ) {
        return;
    }

    // Calculate required height and update if necessary
    const requiredHeight = numRows + numRows * rowGap + 2; // +2 for the top and bottom margins
    if (requiredHeight > rows) {
        errorMessage += `The required height (${requiredHeight}) exceeds the specified height (${rows}).\n`;
        document.getElementById("rows").value = requiredHeight;
    }

    // Calculate the total number of chairs and required stacks
    const totalChairs = numRows * 2 * chairsPerRow;
    const requiredStacks = Math.ceil(totalChairs / 3);

    // Calculate the total width required for chairs and aisle, and update if necessary
    const totalChairWidth = chairsPerRow * 2 + aisleGap;
    if (totalChairWidth > columns && totalChairWidth >= requiredStacks) {
        errorMessage += `The required width (${totalChairWidth}) exceeds the specified width (${columns}).`;
        document.getElementById("columns").value = totalChairWidth;
    } else if (requiredStacks > columns) {
        errorMessage += `The required number of stacks (${requiredStacks}) exceeds the available space from the specified width (${columns}).`;
        document.getElementById("columns").value = requiredStacks;
    }

    // Display error message or generate layout JSON
    if (errorMessage !== "") {
        alert(errorMessage.trim());
    } else {
        // Generate layout JSON
        const layoutJson = generateLayoutJson(
            rows,
            columns,
            numRows,
            chairsPerRow,
            aisleGap,
            rowGap
        );

        // Store in session storage
        sessionStorage.setItem("tempLayout", layoutJson);

        // For demonstration purposes, we're logging the JSON to the console
        console.log(layoutJson);
        // Use the Clipboard API to write the layout JSON string to the clipboard
        navigator.clipboard.writeText(layoutJson).then(
            () => {
                alert("JSON data for layout copied to clipboard!");
            },
            (err) => {
                console.error("Could not copy text: ", err);
            }
        );
        window.location.href = `index.html?useTempLayout=true`;
    }
});

function generateLayoutJson(
    rows,
    columns,
    numRows,
    chairsPerRow,
    aisleGap,
    rowGap
) {
    const layout = {
        stacked: false,
        dimensions: { rows, columns },
        robot: null, // Assuming robot position is not part of the premade layouts
        stacks: [],
        obstacles: [], // Assuming obstacles are not part of the premade layouts
    };

    // Calculate required stacks based on the total number of chairs
    const totalChairs = numRows * 2 * chairsPerRow;
    const requiredStacks = Math.ceil(totalChairs / 3);

    // Initialize stacks at the bottom of the room
    for (let i = 0; i < requiredStacks; i++) {
        layout.stacks.push({
            location: `${rows}-${i + 1}`,
            rotation: 0, // No rotation for stacks
            chairs: [], // Stacks initially empty
        });
    }

    // Calculate the start position for the chairs, centered around the aisle
    const totalChairWidth = chairsPerRow * 2 + aisleGap;
    const leftStart = Math.ceil((columns - totalChairWidth) / 2) + 1;
    const rightStart = leftStart + chairsPerRow + aisleGap;

    let currentStack = 0; // Index of the current stack being used

    for (let row = 1; row <= numRows; row++) {
        for (let chair = 0; chair < chairsPerRow; chair++) {
            // Assign chairs to stacks, ensuring no more than 3 chairs per stack
            if (layout.stacks[currentStack].chairs.length >= 3) {
                currentStack++; // Move to the next stack when the current one is full
            }

            const chairLocationLeft = `${row * (1 + rowGap)}-${
                leftStart + chair
            }`;
            const chairLocationRight = `${row * (1 + rowGap)}-${
                rightStart + chair
            }`;

            // Add chair to the current stack for the left side
            layout.stacks[currentStack].chairs.push({
                location: chairLocationLeft,
                rotation: 0, // All chairs facing forward (rotation 0)
            });

            // Check if the stack is full before adding a chair to the right side
            if (layout.stacks[currentStack].chairs.length >= 3) {
                currentStack++; // Move to the next stack if necessary
            }

            // Add chair to the current stack for the right side
            layout.stacks[currentStack].chairs.push({
                location: chairLocationRight,
                rotation: 0, // All chairs facing forward (rotation 0)
            });
        }
    }

    return JSON.stringify(layout, null, 2); // Pretty print the JSON
}

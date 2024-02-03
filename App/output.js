// JSON Output
document
    .getElementById("output-json") // if button is clicked
    .addEventListener("click", function (event) {
        event.preventDefault(); // Prevent any default button action

        const gridData = {
            dimensions: { rows, columns },
            robot: null,
            stacks: [],
            obstacles: [],
        };

        // Robot location
        const robotElement = document.querySelector(".robot-in-grid");
        if (robotElement) {
            gridData.robot = robotElement.parentElement.id.replace("item-", ""); // Remove 'item-' prefix to get the location
        }

        // Iterate through all grid items to find stacks, chairs, and obstacles
        document.querySelectorAll(".grid-item").forEach((item) => {
            // Check for obstacles
            if (item.classList.contains("black")) {
                const obstacleLocation = item.id.replace("item-", ""); // Remove 'item-' prefix to get the location
                gridData.obstacles.push(obstacleLocation); // Add to obstacles list
            }

            const chairContainer = item.querySelector(
                ".chair-container-in-grid"
            );

            // If chair exists
            if (chairContainer) {
                const chairTextElement = chairContainer.querySelector(
                    ".chair-text-in-grid"
                );
                const chairText = chairTextElement
                    ? chairTextElement.textContent
                    : "";
                const chairImage =
                    chairContainer.querySelector(".chair-in-grid");
                const rotation = chairImage.dataset.rotation || 0;

                if (chairText.startsWith("S")) {
                    // Stack found
                    const stackLocation = item.id.replace("item-", ""); // Remove 'item-' prefix to get the location
                    const stack = {
                        location: stackLocation,
                        rotation: parseInt(rotation, 10),
                        chairs: [],
                    };

                    // Find all associated C chairs
                    document
                        .querySelectorAll(".chair-text-in-grid")
                        .forEach((cChairText) => {
                            // Check if the chair text includes the current stack's ID and it's not the stack itself
                            if (
                                cChairText.textContent.includes(
                                    `(${chairText})`
                                ) &&
                                cChairText !== chairTextElement
                            ) {
                                // Includes both image and text
                                const cChairContainer = cChairText.closest(
                                    ".chair-container-in-grid"
                                );
                                // Chair image
                                const cChairImage =
                                    cChairContainer.querySelector(
                                        ".chair-in-grid"
                                    );
                                // Chair rotation
                                const cRotation =
                                    cChairImage.dataset.rotation || 0;
                                const cChairLocation =
                                    cChairContainer.parentElement.id.replace(
                                        "item-",
                                        ""
                                    ); // Remove 'item-' prefix to get the location
                                // Add C chair to the stack's 'chairs' array
                                stack.chairs.push({
                                    location: cChairLocation,
                                    rotation: parseInt(cRotation, 10),
                                });
                            }
                        });

                    // Add the fully constructed stack object to the 'stacks' array in the gridData object
                    gridData.stacks.push(stack);
                }
            }
        });

        // Convert the grid data object to a JSON string
        const gridDataJson = JSON.stringify(gridData, null, 2); // Pretty print the JSON

        // Output the JSON string
        console.log(gridDataJson); // Log to the console (inspect in Google Chrome)
    });
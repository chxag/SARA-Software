// JSON Output
function generateGridDataJson() {
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

        const chairContainer = item.querySelector(".chair-container-in-grid");

        // If chair exists
        if (chairContainer) {
            const chairTextElement = chairContainer.querySelector(
                ".chair-text-in-grid"
            );
            const chairText = chairTextElement
                ? chairTextElement.textContent
                : "";
            const chairImage = chairContainer.querySelector(".chair-in-grid");
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
                            cChairText.textContent.includes(`(${chairText})`) &&
                            cChairText !== chairTextElement
                        ) {
                            // Includes both image and text
                            const cChairContainer = cChairText.closest(
                                ".chair-container-in-grid"
                            );
                            // Chair image
                            const cChairImage =
                                cChairContainer.querySelector(".chair-in-grid");
                            // Chair rotation
                            const cRotation = cChairImage.dataset.rotation || 0;
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

    return gridDataJson;
}

const sendData = () => {
    const invalidChair = document.querySelector(".highlighted-red");
    if (invalidChair) {
        alert("Invalid chairs present in grid.");
        return;
    }

    const gridDataJson = generateGridDataJson();
    console.log(gridDataJson);

    fetch("http://localhost:8082/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: gridDataJson,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
};

document.getElementById("send-json").addEventListener("click", sendData);

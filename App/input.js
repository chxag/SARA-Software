document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    if (!file.name.toLowerCase().endsWith(".pgm")) {
        alert("Please upload a PGM file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:8082/upload", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.status === "success") {
                // Ensure the path matches how your server serves static files
                const imageUrl = `http://localhost:8082/${result.pngPath}`;
                displayImageAndRotationControl(imageUrl);
                sessionStorage.setItem("uploadedFilename", result.filename); // Save the filename for later use
                // console.log(
                //     "Stored filename:",
                //     sessionStorage.getItem("uploadedFilename")
                // );
            } else {
                alert("Error uploading file.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Error during server communication.");
        });
});

function displayImageAndRotationControl(imageUrl) {
    const uploadedImage = document.getElementById("uploadedImage");
    const rotationControl = document.getElementById("rotationControl");

    // Set the image source; this triggers the loading and the onload event
    uploadedImage.src = imageUrl;
    uploadedImage.classList.remove("hidden");

    // Show the rotation control
    rotationControl.style.display = "block";

    document
        .getElementById("rotationRange")
        .addEventListener("input", function () {
            const rotationDegrees = this.value;
            uploadedImage.style.transform = `rotate(${rotationDegrees}deg)`;
        });
}

window.addEventListener("pageshow", function () {
    const uploadedImage = document.getElementById("uploadedImage");
    const fileInput = document.getElementById("fileInput");

    // Check if the image source is missing and a file was previously selected
    if (
        uploadedImage &&
        !uploadedImage.src &&
        fileInput &&
        fileInput.files.length > 0
    ) {
        // Clear the file input
        fileInput.value = "";
    }
});

document.getElementById("uploadData").addEventListener("click", function () {
    const pgmRows = parseInt(document.getElementById("pgmRows").value);
    const pgmColumns = parseInt(document.getElementById("pgmColumns").value);
    const filename = sessionStorage.getItem("uploadedFilename");
    const rotationDegrees = parseInt(
        document.getElementById("rotationRange").value
    );

    if (!pgmRows || !pgmColumns) {
        alert("Please enter dimensions.");
        return;
    }

    fetch("http://localhost:8082/process_and_generate_grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pgmRows: pgmRows,
            pgmColumns: pgmColumns,
            filename: filename,
            rotationDegrees: rotationDegrees, // Send the rotation degrees to the server
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.status === "success") {
                sessionStorage.setItem("pgmTransfer", true);
                window.location.href = "index.html"; // Redirect to index.html
            } else {
                alert("Error generating grid.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Error during grid generation.");
        });
});

document.getElementById("generateLayout").addEventListener("click", () => {
    let errorMessage = "";

    // const rows = parseInt(document.getElementById("rows").value);
    // const columns = parseInt(document.getElementById("columns").value);
    const numRows = parseInt(document.getElementById("numRows").value);
    const chairsPerRow = parseInt(
        document.getElementById("chairsPerRow").value
    );
    const aislesValue = document.getElementById("aisles").value;
    const aisleGap = parseInt(document.getElementById("aisleGap").value);
    const rowGap = parseInt(document.getElementById("rowGap").value);

    if (
        // !rows ||
        // !columns ||
        !numRows ||
        !chairsPerRow ||
        !aislesValue ||
        !aisleGap ||
        !rowGap
    ) {
        alert("Fill in empty inputs.");
        return;
    }

    const aisles = parseInt(aislesValue);
    console.log(aisles);

    const sections = aisles + 1;

    // Calculate the total number of chairs and required stacks
    const totalChairs = numRows * sections * chairsPerRow;
    const requiredStacks = Math.ceil(totalChairs / 3);

    // Calculate the total width required for chairs and aisle, and update if necessary
    const totalChairWidth = chairsPerRow * sections + aisleGap * aisles;

    let columns = Math.max(totalChairWidth, requiredStacks);

    if (
        (requiredStacks === totalChairWidth && aisles === 0) ||
        requiredStacks - 1 === totalChairWidth
    ) {
        columns++;
    }

    // if (totalChairWidth > columns && totalChairWidth >= requiredStacks) {
    //     errorMessage += `The required width (${totalChairWidth}) exceeds the specified width (${columns}).\n`;
    //     document.getElementById("columns").value = totalChairWidth;
    // } else if (requiredStacks > columns) {
    //     errorMessage += `The required number of stacks (${requiredStacks}) exceeds the available space from the specified width (${columns}).\n`;
    //     document.getElementById("columns").value = requiredStacks;
    // }

    // Calculate required height and update if necessary
    const requiredHeight = numRows + numRows * rowGap + 2; // +2 for the top and bottom margins
    const rows = requiredHeight;
    // if (requiredHeight > rows) {
    //     errorMessage += `The required height (${requiredHeight}) exceeds the specified height (${rows}).`;
    //     document.getElementById("rows").value = requiredHeight;
    // }

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
            aisles,
            aisleGap,
            rowGap
        );

        // Store in session storage
        sessionStorage.setItem("tempLayout", layoutJson);
        // console.log(layoutJson);

        // // Use the Clipboard API to write the layout JSON string to the clipboard
        // navigator.clipboard.writeText(layoutJson).then(
        //     () => {
        //         alert("JSON data for layout copied to clipboard!");
        //     },
        //     (err) => {
        //         console.error("Could not copy text: ", err);
        //     }
        // );
        window.location.href = `index.html?useTempLayout=true`;
    }
});

function generateLayoutJson(
    rows,
    columns,
    numRows,
    chairsPerRow,
    aisles,
    aisleGap,
    rowGap
) {
    // Calculate the number of sections (aisle + 1)
    const sections = aisles + 1;
    // Calculate total chairs considering all sections
    const totalChairs = numRows * sections * chairsPerRow;
    // Calculate required stacks
    const requiredStacks = Math.ceil(totalChairs / 3);

    const layout = {
        stacked: false,
        dimensions: { rows, columns },
        robot: null,
        stacks: [],
        obstacles: [],
    };

    // Initialize stacks at the bottom of the room
    for (let i = 0; i < requiredStacks; i++) {
        layout.stacks.push({
            location: `${rows}-${i + 1}`,
            rotation: 0,
            chairs: [],
        });
    }

    // console.log(sections);

    // Calculate the start position for the chairs, taking aisles into account
    const totalChairWidth = chairsPerRow * sections + aisleGap * aisles;
    const startColumn = Math.ceil((columns - totalChairWidth) / 2) + 1;

    // Bottom row of chairs should be two rows above the stacks
    const bottomChairRow = rows - 2;

    for (let row = 0; row < numRows; row++) {
        const rowPosition = bottomChairRow - row * (1 + rowGap);

        for (let section = 0; section < sections; section++) {
            for (let chair = 0; chair < chairsPerRow; chair++) {
                // Calculate column for each chair, accounting for sections and aisle gaps
                const chairColumn =
                    startColumn + (chairsPerRow + aisleGap) * section + chair;

                // Add chair to the stacks
                addChairToStack(layout.stacks, rowPosition, chairColumn);
            }
        }
    }

    return JSON.stringify(layout, null, 2);
}

function addChairToStack(stacks, rowPosition, columnPosition) {
    const availableStack = stacks.find((stack) => stack.chairs.length < 3);

    if (!availableStack) {
        console.error("Not enough stacks to accommodate all chairs.");
        return;
    }

    availableStack.chairs.push({
        location: `${rowPosition}-${columnPosition}`,
        rotation: 0,
    });
}

// function generateLayoutJson(
//     rows,
//     columns,
//     numRows,
//     chairsPerRow,
//     aisleGap,
//     rowGap
// ) {
//     const layout = {
//         stacked: false,
//         dimensions: { rows, columns },
//         robot: null, // Assuming robot position is not part of the premade layouts
//         stacks: [],
//         obstacles: [], // Assuming obstacles are not part of the premade layouts
//     };

//     // Calculate required stacks based on the total number of chairs
//     const totalChairs = numRows * 2 * chairsPerRow;
//     const requiredStacks = Math.ceil(totalChairs / 3);

//     // Initialize stacks at the bottom of the room
//     for (let i = 0; i < requiredStacks; i++) {
//         layout.stacks.push({
//             location: `${rows}-${i + 1}`,
//             rotation: 0, // No rotation for stacks
//             chairs: [], // Stacks initially empty
//         });
//     }

//     // Calculate the start position for the chairs, centered around the aisle
//     const totalChairWidth = chairsPerRow * 2 + aisleGap;
//     const leftStart = Math.ceil((columns - totalChairWidth) / 2) + 1;
//     const rightStart = leftStart + chairsPerRow + aisleGap;

//     let currentStack = 0; // Index of the current stack being used

//     for (let row = 1; row <= numRows; row++) {
//         for (let chair = 0; chair < chairsPerRow; chair++) {
//             // Assign chairs to stacks, ensuring no more than 3 chairs per stack
//             if (layout.stacks[currentStack].chairs.length >= 3) {
//                 currentStack++; // Move to the next stack when the current one is full
//             }

//             const chairLocationLeft = `${row * (1 + rowGap)}-${
//                 leftStart + chair
//             }`;
//             const chairLocationRight = `${row * (1 + rowGap)}-${
//                 rightStart + chair
//             }`;

//             // Add chair to the current stack for the left side
//             layout.stacks[currentStack].chairs.push({
//                 location: chairLocationLeft,
//                 rotation: 0, // All chairs facing forward (rotation 0)
//             });

//             // Check if the stack is full before adding a chair to the right side
//             if (layout.stacks[currentStack].chairs.length >= 3) {
//                 currentStack++; // Move to the next stack if necessary
//             }

//             // Add chair to the current stack for the right side
//             layout.stacks[currentStack].chairs.push({
//                 location: chairLocationRight,
//                 rotation: 0, // All chairs facing forward (rotation 0)
//             });
//         }
//     }

//     return JSON.stringify(layout, null, 2); // Pretty print the JSON
// }

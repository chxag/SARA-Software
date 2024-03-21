document.getElementById("uploadData").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

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
            console.log("File uploaded successfully:", result);
            const gridDataFilename = result.gridDataFilename; // Assuming this is the key for the filename in the response
            localStorage.setItem("gridDataFilename", gridDataFilename); // Store filename in localStorage
            window.location.href = "index.html"; // Redirect to index.html
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Error during server communication.");
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

    if (
        !rows ||
        !columns ||
        !numRows ||
        !chairsPerRow ||
        !aisleGap ||
        !rowGap
    ) {
        alert("Fill in empty inputs.");
        return;
    }

    // Calculate the total number of chairs and required stacks
    const totalChairs = numRows * 2 * chairsPerRow;
    const requiredStacks = Math.ceil(totalChairs / 3);

    // Calculate the total width required for chairs and aisle, and update if necessary
    const totalChairWidth = chairsPerRow * 2 + aisleGap;
    if (totalChairWidth > columns && totalChairWidth >= requiredStacks) {
        errorMessage += `The required width (${totalChairWidth}) exceeds the specified width (${columns}).\n`;
        document.getElementById("columns").value = totalChairWidth;
    } else if (requiredStacks > columns) {
        errorMessage += `The required number of stacks (${requiredStacks}) exceeds the available space from the specified width (${columns}).\n`;
        document.getElementById("columns").value = requiredStacks;
    }

    // Calculate required height and update if necessary
    const requiredHeight = numRows + numRows * rowGap + 2; // +2 for the top and bottom margins
    if (requiredHeight > rows) {
        errorMessage += `The required height (${requiredHeight}) exceeds the specified height (${rows}).`;
        document.getElementById("rows").value = requiredHeight;
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
        console.log(layoutJson);

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

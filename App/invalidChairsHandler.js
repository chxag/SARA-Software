function isDirectionClear(chairContainer, direction) {
    const [prefix, row, col] = chairContainer.parentElement.id.split("-");
    const currentRow = parseInt(row);
    const currentCol = parseInt(col);

    // Calculate the grid item position based on the direction
    const dirOffsets = {
        N: [-1, 0],
        NE: [-1, 1],
        E: [0, 1],
        SE: [1, 1],
        S: [1, 0],
        SW: [1, -1],
        W: [0, -1],
        NW: [-1, -1],
    };
    const [dRow, dCol] = dirOffsets[direction];
    const nextRow = currentRow + dRow;
    const nextCol = currentCol + dCol;
    const nextPosition = `item-${nextRow}-${nextCol}`;

    if (nextRow <= 0 || nextRow > rows || nextCol <= 0 || nextCol > columns) {
        return false; // Outside grid bounds
    }

    const nextGridItem = document.getElementById(nextPosition);
    return (
        !nextGridItem.classList.contains("black") &&
        !nextGridItem.querySelector(".chair-container-in-grid")
    );
}

function getClearDirections(rotation) {
    // Map rotation ranges to clear directions
    const directionRanges = [
        { range: [0, 0], directions: ["N"] },
        { range: [1, 10], directions: ["N", "NE"] },
        { range: [11, 79], directions: ["N", "NE", "E"] },
        { range: [80, 89], directions: ["NE", "E"] },
        { range: [90, 90], directions: ["E"] },
        { range: [91, 100], directions: ["E", "SE"] },
        { range: [101, 169], directions: ["E", "SE", "S"] },
        { range: [170, 179], directions: ["SE", "S"] },
        { range: [180, 180], directions: ["S"] },
        { range: [181, 190], directions: ["S", "SW"] },
        { range: [191, 259], directions: ["S", "SW", "W"] },
        { range: [260, 269], directions: ["SW", "W"] },
        { range: [270, 270], directions: ["W"] },
        { range: [271, 280], directions: ["W", "NW"] },
        { range: [281, 349], directions: ["W", "NW", "N"] },
        { range: [350, 359], directions: ["NW", "N"] },
    ];

    for (const { range, directions } of directionRanges) {
        if (rotation >= range[0] && rotation <= range[1]) {
            return directions;
        }
    }
    return []; // No clear directions if outside specified ranges
}

function highlightInaccessibleChairs() {
    // Clear previous highlights
    document.querySelectorAll(".highlighted-red").forEach((element) => {
        element.classList.remove("highlighted-red");
    });

    // Highlight chairs based on direct obstructions
    document
        .querySelectorAll(".chair-container-in-grid")
        .forEach((chairContainer) => {
            const chairImage = chairContainer.querySelector(".chair-in-grid");
            const rotation = parseInt(chairImage.dataset.rotation);
            const clearDirections = getClearDirections(rotation);

            // Check if the direction in front of the chair is clear
            const isFrontClear = clearDirections.every((direction) =>
                isDirectionClear(chairContainer, direction)
            );

            if (!isFrontClear) {
                chairContainer.classList.add("highlighted-red");
            }
        });

    // If the robot is not placed, no further checks are needed
    const robotElement = document.querySelector(".robot-in-grid");
    if (!robotElement) return;

    // BFS to find accessible grid items from the robot's position
    const robotPosition = robotElement.parentElement.id; // "item-row-col"
    const queue = [robotPosition];
    const visited = new Set([robotPosition]);

    while (queue.length > 0) {
        const currentPosition = queue.shift(); // "item-row-col"
        const [prefix, row, col] = currentPosition.split("-");
        const currentRow = parseInt(row);
        const currentCol = parseInt(col);

        // Directions: up, right, down, left
        const directions = [
            [-1, 0], // Up
            [0, 1], // Right
            [1, 0], // Down
            [0, -1], // Left
        ];

        directions.forEach(([dRow, dCol]) => {
            const nextRow = currentRow + dRow;
            const nextCol = currentCol + dCol;
            const nextPosition = `item-${nextRow}-${nextCol}`;

            if (
                nextRow > 0 &&
                nextRow <= rows &&
                nextCol > 0 &&
                nextCol <= columns &&
                !visited.has(nextPosition)
            ) {
                const nextGridItem = document.getElementById(nextPosition);
                if (
                    !nextGridItem.classList.contains("black") &&
                    !nextGridItem.querySelector(".chair-container-in-grid")
                ) {
                    queue.push(nextPosition);
                }
                visited.add(nextPosition); // Mark position as visited to avoid revisiting
            }
        });
    }

    // Highlight chairs where the robot cannot reach the position in front of the chair
    document
        .querySelectorAll(".chair-container-in-grid")
        .forEach((chairContainer) => {
            if (!chairContainer.classList.contains("highlighted-red")) {
                const chairImage =
                    chairContainer.querySelector(".chair-in-grid");
                const rotation = parseInt(chairImage.dataset.rotation);
                const clearDirections = getClearDirections(rotation);

                const frontClear = clearDirections.every((direction) => {
                    const frontPosition = getAdjacentPosition(
                        chairContainer.parentElement.id,
                        direction
                    );
                    return visited.has(frontPosition);
                });

                if (!frontClear) {
                    chairContainer.classList.add("highlighted-red");
                }
            }
        });
}

function getAdjacentPosition(currentPosition, direction) {
    const [prefix, row, col] = currentPosition.split("-");
    const currentRow = parseInt(row);
    const currentCol = parseInt(col);
    const dirOffsets = {
        N: [-1, 0],
        NE: [-1, 1],
        E: [0, 1],
        SE: [1, 1],
        S: [1, 0],
        SW: [1, -1],
        W: [0, -1],
        NW: [-1, -1],
    };
    const [dRow, dCol] = dirOffsets[direction];
    const nextRow = currentRow + dRow;
    const nextCol = currentCol + dCol;
    return `item-${nextRow}-${nextCol}`;
}

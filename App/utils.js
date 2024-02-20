// Grid, stack, chair numbering data
const gridContainer = document.querySelector(".grid-container");
let selectedStack = null; // Stack mode
let selectedMovingChair = null; // Move mode
let selectedRotatingChair = null; // Rotate mode
let defaultRotationDegree = 0; // Default rotation degree for new chairs
const maxChairsPerStack = 3; // Maximum C chairs per stack
const allocatedCNumbersByStack = {}; // for C chairs (chairs associated with stacks, e.g. C1 (S1), C2 (S2))
const allocatedNumbers = new Set(); // for stacks

// Increase number from 1 until non-taken number (for stacks)
function getLowestAvailableNumber() {
    let num = 1;
    while (allocatedNumbers.has(num)) {
        num++;
    }
    return num;
}

function getLowestAvailableCNumber(stackId) {
    if (allocatedCNumbersByStack[stackId] === undefined) {
        allocatedCNumbersByStack[stackId] = 0; // Initialize with 0 C chairs
    }
    if (allocatedCNumbersByStack[stackId] >= maxChairsPerStack) {
        return null; // No more C chairs can be added
    }
    // Increment the count since we're adding a new C chair
    return ++allocatedCNumbersByStack[stackId];
}

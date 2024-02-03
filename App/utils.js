// Grid, stack, chair numbering data
const gridContainer = document.querySelector(".grid-container");
let selectedStack = null;

// Stack/chair number calculation
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

// Increase number from 1 until non-taken number (for C chairs)
function getLowestAvailableCNumber(stackId) {
    if (!allocatedCNumbersByStack[stackId]) {
        // Add new set in array if stack doesn't have its set of chairs yet
        allocatedCNumbersByStack[stackId] = new Set();
    }
    let num = 1;
    while (allocatedCNumbersByStack[stackId].has(num)) {
        num++;
    }
    allocatedCNumbersByStack[stackId].add(num); // Used C number for this stack
    return num;
}

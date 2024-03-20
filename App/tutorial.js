let currentStep = 0; // Track the current step of the tutorial

document.addEventListener("DOMContentLoaded", function () {
    document
        .getElementById("openTutorial")
        .addEventListener("click", toggleTutorial);
    document
        .getElementById("closeTutorial")
        .addEventListener("click", toggleTutorial);

    document.addEventListener("keydown", function (event) {
        if (
            document
                .getElementById("tutorialOverlay")
                .classList.contains("hidden")
        ) {
            if (event.key.toLowerCase() === "x") {
                toggleTutorial();
            }
        } else {
            switch (event.key.toLowerCase()) {
                case "x":
                    toggleTutorial();
                    break;
                case "a":
                case "arrowleft":
                    navigateTutorial(-1); // Move to the previous step
                    break;
                case "d":
                case "arrowright":
                    navigateTutorial(1); // Move to the next step
                    break;
            }
        }
    });

    createNavigationButtons();
    showTutorialStep(currentStep);
});

function navigateTutorial(direction) {
    const newIndex = currentStep + direction;
    if (newIndex >= 0 && newIndex < tutorialData.length) {
        showTutorialStep(newIndex);
    }
}

function toggleTutorial() {
    const overlay = document.getElementById("tutorialOverlay");
    overlay.classList.toggle("hidden");
    if (!overlay.classList.contains("hidden")) {
        showTutorialStep(currentStep);
    }
}

function showTutorialStep(step) {
    if (step >= 0 && step < tutorialData.length) {
        currentStep = step; // Update current step only if within bounds

        const imagesContainer = document.getElementById("tutorialImages");
        imagesContainer.innerHTML = tutorialData[step].images
            .map(
                (imageSrc) =>
                    `<img src="${imageSrc}" alt="Tutorial Image" class="tutorial-image">`
            )
            .join("");

        document.getElementById("tutorialText").innerHTML =
            tutorialData[step].text;

        // Highlight the active step button
        document
            .querySelectorAll(".tutorial-nav-button")
            .forEach((btn, index) => {
                btn.classList.toggle("active", index === step);
            });
    }
}

const tutorialData = [
    {
        text: "Press X on your keyboard to quickly open/close the tutorial, and A/D or Left/Right to navigate through steps. You can toggle between <strong>modes</strong> by clicking the icons in the bottom left corner, or by pressing numbers 1 to 6 on PC. There are <strong>zoom controls</strong> in the bottom right corner.",
        images: ["Tutorial_Images/1.png"],
    },
    {
        text: `Activate <strong>Stack mode</strong> to place stacks on empty grid cells. Next, activate <strong>Place mode</strong> to first select a stack (e.g. "S1"), then place chairs of the selected stack (e.g. "C1 (S1)", "C2 (S1)", "C3 (S1)"). The numbering on the chairs is merely to display associations between stacks and chairs. The number of chairs per stack is limited and the remainding number of chairs for a selected stack is displayed at the bottom.`,
        images: ["Tutorial_Images/2.png"],
    },
    {
        text: `On PC, if you hover over an empty cell in Stack mode (or Place mode), while pressing <strong>QWERT keys</strong>, the chair rotates to another default angle (QW = anti-clockwise, ER = clockwise, T = 180). In <strong>Rotate mode</strong>, click chairs to rotate 90 degrees clockwise, or press QWERT keys while hovering over chairs to rotate more precisely. You can also hold down on a chair to open a control panel to rotate more precisely and set a default rotation angle.`,
        images: ["Tutorial_Images/3.png", "Tutorial_Images/4.png"],
    },
    {
        text: `Chairs <strong>highlighted red</strong> denote that the chair is inaccessible for SARA. The front of the chair needs to be clear for SARA to interact with it. Chairs can also be inaccessible due to no possible pathing from SARA to those chairs. SARA can be placed in <strong>Robot mode</strong>.`,
        images: ["Tutorial_Images/5.png", "Tutorial_Images/6.png"],
    },
    {
        text: `In <strong>Move mode</strong>, there are two ways to select chairs (press E to switch, Q to deselect). Both ways allow you to move the selected chairs with the buttons on the bottom, or with WASD or arrows keys on PC. In <strong>Single-Select Mode</strong>, you can select a chair and then click where it would go to.`,
        images: ["Tutorial_Images/move1.png", "Tutorial_Images/move2.png"],
    },
    {
        text: `In <strong>Delete mode</strong>, deleting a stack would also delete all the associated chairs of that stack. If <strong>no modes</strong> are activated, you can click on a chair to highlight associations where stacks are highlighted yellow and their chairs are highlighted blue.`,
        images: ["Tutorial_Images/7.png"],
    },
    {
        text: `You can <strong>save the layout</strong> by first giving it a name. Once a layout is saved, it will be considered a room SARA can operate within. Rooms are either in a stacked or unstacked state, and greyed out chairs represent chairs not physically present. You can now finally <strong>initiate the robot</strong> to start doing its work, which would eventually change the room state and greyed out chairs.`,
        images: ["Tutorial_Images/8.png", "Tutorial_Images/9.png"],
    },
    {
        text: `You can access any room in the future in the <strong>'Choose Ready Rooms'</strong> page found at the navigation bar. You will also be able to rename and delete rooms, as well as have the JSON data associated with the rooms there. Use the <strong>Template</strong> feature to automatically generate a theatre-style layout.`,
        images: ["Tutorial_Images/10.png"],
    },
];

function createNavigationButtons() {
    const navigationContainer = document.getElementById("tutorialNavigation");
    tutorialData.forEach((_, index) => {
        const button = document.createElement("button");
        button.textContent = index + 1;
        button.classList.add("tutorial-nav-button");
        button.addEventListener("click", () => showTutorialStep(index));
        navigationContainer.appendChild(button);
    });
}

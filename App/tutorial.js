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

        // Update tutorial title
        document.getElementById("tutorialTitle").textContent =
            tutorialData[step].title;

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
        title: "Tutorial",
        text: "Press X on your keyboard to quickly open/close the tutorial, and A/D or Left/Right to navigate through tutorial steps. You can toggle between <strong>modes</strong> by clicking the icons in the bottom left corner, or by pressing numbers 1 to 7 on PC. There are <strong>zoom controls</strong> in the bottom right corner.",
        images: ["Tutorial_Images/1.png"],
        buttonClass: "tutorial-button-blue",
    },
    {
        title: "Grid Dimensions",
        text: "Use the <strong>Empty Grid</strong> option in the <strong>New Room</strong> page (found at navigation bar at the top) to create a new grid with entered dimensions. Once generated, you can use the blue and red arrows around the grid to increase or decrease dimensions one at a time. You will be asked to confirm before removing a row or column if it is not empty.",
        images: ["Tutorial_Images/empty_grid.png", "Tutorial_Images/add.png"],
        buttonClass: "tutorial-button-blue",
    },
    {
        title: "Stacks and Chairs",
        text: `In order to place chairs, you must first place a stack to take them from. Select <strong>Stack mode</strong> to place stacks on empty grid cells. Next, select <strong>Place mode</strong> to first select a stack (e.g. "S1"), then place chairs of the selected stack (e.g. "C1 (S1)", "C2 (S1)", "C3 (S1)"). The numbering on the chairs is merely to display associations between stacks and chairs. The number of chairs per stack is limited and the remainding number of chairs for a selected stack is displayed at the bottom.`,
        images: ["Tutorial_Images/2.png"],
        buttonClass: "tutorial-button-blue",
    },
    {
        title: "Rotating Chairs",
        text: `In <strong>Rotate Mode</strong>, click chairs to rotate them 90° clockwise. Hold down on a chair to open a control panel to rotate it more precisely and set a default rotation angle for future placements. On PC only, you can hover the pointer over chairs and use the <strong>QWERT keys</strong> to rotate them (Q and R rotate 90° anticlockwise and clockwise, W and E rotate 10° anticlockwise and clockwise, T rotates 180°). Additionally, you can use the QWERT keys to change the default angle before placing in Stack or Place mode.`,
        images: ["Tutorial_Images/4.png", "Tutorial_Images/3.png"],
        buttonClass: "tutorial-button-red",
    },
    {
        title: "Moving Chairs",
        text: `In <strong>Move mode</strong>, there are two ways to select chairs (press F to quickly switch selection mode, Q to select all, E to deselect all). Both ways allow you to move the selected chairs with the buttons on the bottom, or with WASD or arrows keys on PC. In <strong>Single-Select Mode</strong>, you can also click where you want your selected chair to go.`,
        images: ["Tutorial_Images/move1.png", "Tutorial_Images/move2.png"],
        buttonClass: "tutorial-button-red",
    },
    {
        title: "Deleting Chairs and Association Highlights",
        text: `In <strong>Delete mode</strong>, deleting a stack would also delete all the associated chairs of that stack. If <strong>no modes</strong> are selected, you can click on a chair to highlight associations where stacks are highlighted yellow and their chairs are highlighted blue.`,
        images: ["Tutorial_Images/7.png"],
        buttonClass: "tutorial-button-red",
    },
    {
        title: "Red Highlights and Robot Mode",
        text: `Chairs <strong>highlighted red</strong> denote that the chair is inaccessible for SARA. The front of the chair needs to be clear for SARA to interact with it. Chairs can also be inaccessible due to no possible pathing from SARA to those chairs. SARA can be placed in <strong>Robot mode</strong>.`,
        images: ["Tutorial_Images/5.png", "Tutorial_Images/6.png"],
        buttonClass: "tutorial-button-green",
    },
    {
        title: "Obstacles",
        text: `Obstacles are any obstruction (e.g. walls, tables) that SARA cannot move into. In <strong>Obstacle mode</strong>, click empty cells to turn them into obstacles, and click obstacles to turn them back to empty cells. Chairs blocked by obstacles would also be highlighted red.`,
        images: ["Tutorial_Images/obstacle.png"],
        buttonClass: "tutorial-button-green",
    },
    {
        title: "Saving, Rotating, and Clearing Layouts",
        text: `Use the <strong>Save Layout</strong> button beneath the grid to save your current layout, and give it an identifying name. You can use the button again to update this room, or save another copy with a different name. The <strong>Rotate Layout</strong> button rotates your entire layout 90° clockwise. The <strong>Clear Layout</strong> button will remove everything in the room, and will additionally ask if you want to remove obstacles too if they exist.`,
        images: ["Tutorial_Images/save.png", "Tutorial_Images/rotate.png"],
        buttonClass: "tutorial-button-green",
    },
    {
        title: "Initiating Robot",
        text: `Once a layout is saved, it will be considered a room SARA can operate within. Rooms are either in a stacked or unstacked state, and greyed out chairs would represent chairs not physically present. You can now finally <strong>initiate the robot</strong> to start doing its work, which would change the room state and greyed out chairs.`,
        images: ["Tutorial_Images/8.png", "Tutorial_Images/9.png"],
        buttonClass: "tutorial-button-green",
    },
    {
        title: "Viewing and Loading Saved Rooms",
        text: `Access any saved room in the <strong>Room Data</strong> page (found at navigation bar at the top). You will also be able to rename and delete rooms, as well as copy their JSON data as text. The JSON text represents rooms, which can be shared (e.g. through email) and pasted back into the app to regenerate rooms.`,
        images: ["Tutorial_Images/10.png"],
        buttonClass: "tutorial-button-yellow",
    },
    {
        title: "Theatre-Style Layout",
        text: `You can automatically create a <strong>Theatre-Style Layout</strong> in the New Room page. These layouts consist of one or more rows, made of groups of chairs next to each other ("sections") with gaps between each group ("aisles"). You can specify the number of these rows, chairs in each of their sections, and the number of aisles, as well as the size of aisles and the spacing between rows. The required stacks will be placed along the back. Once created, you can then adjust the layout like any other room.`,
        images: [
            "Tutorial_Images/theatre_ui.png",
            "Tutorial_Images/theatre.png",
        ],
        buttonClass: "tutorial-button-yellow",
    },
    {
        title: "PGM",
        text: `PGM maps produced by LiDAR scan can be used to generate a corresponding layout in the app, automatically placing obstacles. Use the <strong>Upload Map as PGM</strong> option on the <strong>New Room</strong> page by uploading a PGM file, then rotate the map so it is positioned upright, with the bottom edge of the map along the bottom of the window. Finally, specify the width and height of the scanned area in cm. Once created, you can then adjust the layout like any other room.`,
        images: ["Tutorial_Images/pgm_ui.png", "Tutorial_Images/pgm.png"],
        buttonClass: "tutorial-button-yellow",
    },
];

function createNavigationButtons() {
    const navigationContainer = document.getElementById("tutorialNavigation");
    tutorialData.forEach((item, index) => {
        const button = document.createElement("button");
        button.textContent = index + 1;
        button.classList.add("tutorial-nav-button");

        // Apply the specified CSS class if it exists
        if (item.buttonClass) {
            button.classList.add(item.buttonClass);
        }

        button.addEventListener("click", () => showTutorialStep(index));
        navigationContainer.appendChild(button);
    });
}

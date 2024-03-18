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

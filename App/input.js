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

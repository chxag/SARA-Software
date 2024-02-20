// This is only used in input.html

document.getElementById("uploadData").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0]; // Get the first file from the file input

    // Check if a file is selected
    if (!file) {
        alert("Please select a file.");
        return;
    }

    // Check for PGM file extension
    const fileName = file.name.toLowerCase();
    const isPGM = fileName.endsWith(".pgm");
    if (!isPGM) {
        alert("Please upload a PGM file.");
        return;
    }

    // Use FileReader to read the file content
    const reader = new FileReader();
    reader.onload = function (e) {
        const pgm_file = e.target.result; // This is the content of the PGM file
        // Perform your actions with the PGM file content here
        // For example, you can store it in localStorage (if it's not too large)
        // localStorage.setItem("pgmFileData", pgm_file);

        // Assuming you want to redirect after successful upload and processing
        // window.location.href = "index.html";
    };
    reader.onerror = function () {
        alert("Error reading file.");
    };

    // Read the file as text (or as ArrayBuffer/BinaryString based on PGM content handling)
    reader.readAsText(file);

    // previous code
    const jsonData = null; // replace, return json input into here
    try {
        // Parse to ensure valid JSON
        const parsedData = JSON.parse(jsonData);
        // Save to localStorage
        localStorage.setItem("gridData", JSON.stringify(parsedData));
        // Redirect to index.html
        window.location.href = "index.html";
    } catch (error) {
        alert("Invalid JSON data.");
    }
});

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

    // Create a new FormData object and append the file
    const formData = new FormData();
    formData.append('file', file);

    // Send the file to the server
    fetch('http://localhost:8082/upload', { //'http://localhost:5000/upload'
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        // After the file is uploaded, process it
        return fetch('http://localhost:8082/grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileName: fileName})
        });
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        try {
            window.location.href = "index.html";
        } catch (error) {
            alert("error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error during server communication.');
    });
});
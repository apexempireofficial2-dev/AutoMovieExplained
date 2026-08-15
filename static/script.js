const movieInput = document.getElementById("movieInput");
const fileInfo = document.getElementById("fileInfo");
const startBtn = document.getElementById("startBtn");

movieInput.addEventListener("change", () => {

    const file = movieInput.files[0];

    if (!file) {
        fileInfo.style.display = "none";
        return;
    }

    const sizeGB = file.size / (1024 * 1024 * 1024);

    fileInfo.style.display = "block";

    fileInfo.innerHTML = `
        <strong>🎬 ${file.name}</strong><br>
        Size: ${sizeGB.toFixed(2)} GB
    `;
});

startBtn.addEventListener("click", () => {

    const file = movieInput.files[0];

    if (!file) {
        alert("Pehle movie upload karo.");
        return;
    }

    alert("Processing system next step mein connect hoga.");
});

const movieInput = document.getElementById("movieInput");
const fileInfo = document.getElementById("fileInfo");
const startBtn = document.getElementById("startBtn");

const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const statusText = document.getElementById("statusText");
const result = document.getElementById("result");


movieInput.addEventListener("change", () => {

    const file = movieInput.files[0];

    if (!file) {
        fileInfo.style.display = "none";
        return;
    }

    const sizeGB = file.size / (1024 * 1024 * 1024);

    fileInfo.style.display = "block";

    fileInfo.innerHTML = `
        🎬 <strong>${file.name}</strong><br>
        Size: ${sizeGB.toFixed(2)} GB
    `;
});


startBtn.addEventListener("click", async () => {

    const file = movieInput.files[0];

    if (!file) {
        alert("Pehle movie upload karo.");
        return;
    }

    startBtn.disabled = true;

    progressSection.style.display = "block";
    statusText.textContent = "📤 Movie upload ho rahi hai...";
    progressPercent.textContent = "0%";
    progressBar.style.width = "0%";
    result.innerHTML = "";

    const formData = new FormData();
    formData.append("movie", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/upload", true);

    xhr.upload.addEventListener("progress", (event) => {

        if (event.lengthComputable) {

            const percent = Math.round(
                (event.loaded / event.total) * 100
            );

            progressBar.style.width = percent + "%";
            progressPercent.textContent = percent + "%";
        }
    });


    xhr.onload = () => {

        startBtn.disabled = false;

        if (xhr.status === 200) {

            const data = JSON.parse(xhr.responseText);

            if (data.success) {

                progressBar.style.width = "100%";
                progressPercent.textContent = "100%";
                statusText.textContent = "✅ Movie uploaded";

                result.innerHTML = `
                    <div class="file-info" style="display:block;">
                        ✅ Movie successfully Termux mein save ho gayi.<br><br>
                        🎬 ${data.filename}<br>
                        📦 ${(data.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </div>
                `;

            } else {

                statusText.textContent = "❌ Upload failed";
                alert(data.error);
            }

        } else {

            statusText.textContent = "❌ Upload failed";
            alert("Upload mein error aa gaya.");
        }
    };


    xhr.onerror = () => {

        startBtn.disabled = false;
        statusText.textContent = "❌ Connection error";

        alert("Termux server se connection nahi ho raha.");
    };


    xhr.send(formData);
});

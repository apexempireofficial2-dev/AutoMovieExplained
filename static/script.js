const movieInput = document.getElementById("movieInput");
const fileInfo = document.getElementById("fileInfo");
const startBtn = document.getElementById("startBtn");

const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const statusText = document.getElementById("statusText");
const result = document.getElementById("result");


let selectedFilename = null;


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
        📦 Size: ${sizeGB.toFixed(2)} GB
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

    progressBar.style.width = "0%";
    progressPercent.textContent = "0%";

    statusText.textContent =
        "📤 Movie upload ho rahi hai...";

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

            progressBar.style.width =
                percent + "%";

            progressPercent.textContent =
                percent + "%";
        }

    });


    xhr.onload = async () => {

        if (xhr.status !== 200) {

            startBtn.disabled = false;

            statusText.textContent =
                "❌ Upload failed";

            alert("Upload failed.");

            return;
        }


        const data = JSON.parse(
            xhr.responseText
        );


        if (!data.success) {

            startBtn.disabled = false;

            alert(data.error);

            return;
        }


        selectedFilename = data.filename;


        progressBar.style.width = "100%";
        progressPercent.textContent = "100%";

        statusText.textContent =
            "🎬 Movie uploaded — scenes detect ho rahe hain...";


        await detectScenes();

    };


    xhr.onerror = () => {

        startBtn.disabled = false;

        statusText.textContent =
            "❌ Connection error";

        alert(
            "Termux server se connection nahi ho raha."
        );

    };


    xhr.send(formData);

});


async function detectScenes() {

    try {

        progressBar.style.width = "100%";

        progressPercent.textContent = "100%";

        statusText.textContent =
            "✂️ Movie ke scenes detect ho rahe hain...";


        const response = await fetch(
            "/detect-scenes",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    filename: selectedFilename
                })
            }
        );


        const data = await response.json();


        if (!data.success) {

            throw new Error(data.error);

        }


        statusText.textContent =
            "✅ Scene detection complete";


        result.innerHTML = `
            <div class="file-info"
                 style="display:block;">

                <strong>
                    🎬 Scene Detection Complete
                </strong>

                <br><br>

                ✂️ Scenes detected:
                <strong>${data.scene_count}</strong>

                <br><br>

                🧠 Next step:
                AI important scenes select karega.

            </div>
        `;


    } catch (error) {

        statusText.textContent =
            "❌ Scene detection failed";

        result.innerHTML = `
            <div class="file-info"
                 style="display:block;">

                ❌ ${error.message}

            </div>
        `;

    }


    startBtn.disabled = false;

}

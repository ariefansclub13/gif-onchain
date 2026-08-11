const gifInput = document.getElementById("gifInput");
const gifPreview = document.getElementById("gifPreview");
const previewContainer = document.getElementById("previewContainer");
const fileName = document.getElementById("fileName");
const addButton = document.getElementById("addButton");
const result = document.getElementById("result");

let selectedGIF = null;

const WORKER_URL =
    "https://broad-cake-b26b.mochamadarie.workers.dev/upload";


/* GIF FILE SELECTION */

if (gifInput) {

    gifInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        if (file.type !== "image/gif") {

            alert("Please select a GIF file.");

            this.value = "";

            return;
        }

        selectedGIF = file;

        fileName.textContent = file.name;

        const imageURL = URL.createObjectURL(file);

        gifPreview.src = imageURL;

        previewContainer.style.display = "block";

    });

}


/* ADD TO COLLECTION */

if (addButton) {

    addButton.addEventListener("click", async function () {

        const gifName =
            document.getElementById("gifName").value.trim();

        const creator =
            document.getElementById("creator").value.trim();

        const description =
            document.getElementById("description").value.trim();


        if (!selectedGIF) {

            alert("Please choose a GIF first.");

            return;

        }


        if (!gifName) {

            alert("Please enter a GIF name.");

            return;

        }


        if (!creator) {

            alert("Please enter the creator name.");

            return;

        }


        addButton.disabled = true;

        addButton.textContent = "Uploading GIF...";

        result.style.display = "block";

        result.textContent =
            "Uploading your GIF to IPFS...";


        try {

            const formData = new FormData();

            formData.append("file", selectedGIF);

            formData.append("name", gifName);


            const response = await fetch(
                WORKER_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.error ||
                    "Upload failed."
                );

            }


            console.log(
                "Pinata response:",
                data
            );


            const cid = data.cid;

            const ipfsURL =
                `https://gateway.pinata.cloud/ipfs/${cid}`;


            result.innerHTML = `
                <strong>GIF uploaded successfully! 🎉</strong>
                <br><br>
                <strong>IPFS CID:</strong>
                <br>
                ${cid}
                <br><br>
                <a
                    href="${ipfsURL}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View GIF on IPFS
                </a>
            `;


            console.log(
                "GIF Metadata:",
                {
                    name: gifName,
                    creator: creator,
                    description: description,
                    cid: cid,
                    ipfs: ipfsURL,
                    createdAt:
                        new Date().toISOString()
                }
            );


        } catch (error) {

            console.error(
                "Upload error:",
                error
            );


            result.textContent =
                "Upload failed: " +
                error.message;


        } finally {

            addButton.disabled = false;

            addButton.textContent =
                "Add to Collection";

        }

    });

}

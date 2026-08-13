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

        const imageURL =
            URL.createObjectURL(file);

        gifPreview.src = imageURL;

        previewContainer.style.display = "block";

    });

}


/* ADD TO COLLECTION */

if (addButton) {

    addButton.addEventListener(
        "click",
        async function () {

            const gifName =
                document
                    .getElementById("gifName")
                    .value
                    .trim();

            const creator =
                document
                    .getElementById("creator")
                    .value
                    .trim();

            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            /* VALIDATION */

            if (!selectedGIF) {

                alert(
                    "Please choose a GIF first."
                );

                return;
            }


            if (!gifName) {

                alert(
                    "Please enter a GIF name."
                );

                return;
            }


            if (!creator) {

                alert(
                    "Please enter the creator name."
                );

                return;
            }


            /* UPLOAD STATE */

            addButton.disabled = true;

            addButton.textContent =
                "Uploading GIF...";

            result.style.display = "block";

            result.textContent =
                "Uploading GIF and metadata to IPFS...";


            try {

                /* FORM DATA */

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    selectedGIF
                );

                formData.append(
                    "name",
                    gifName
                );

                formData.append(
                    "creator",
                    creator
                );

                formData.append(
                    "description",
                    description
                );


                /* SEND TO WORKER */

                const response =
                    await fetch(
                        WORKER_URL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Worker response:",
                    data
                );


                /* ERROR */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Upload failed."
                    );

                }


                /* GET CID */

                const gifCID =
                    data.gif.cid;

                const metadataCID =
                    data.metadata.cid;


                const gifURL =
                    `https://gateway.pinata.cloud/ipfs/${gifCID}`;

                const metadataURL =
                    `https://gateway.pinata.cloud/ipfs/${metadataCID}`;


                /* SHOW RESULT */

                result.innerHTML = `

                    <strong>
                        GIF uploaded successfully! 🎉
                    </strong>

                    <br><br>

                    <strong>
                        GIF CID:
                    </strong>

                    <br>

                    ${gifCID}

                    <br>

                    <a
                        href="${gifURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View GIF on IPFS
                    </a>

                    <br><br>

                    <strong>
                        Metadata CID:
                    </strong>

                    <br>

                    ${metadataCID}

                    <br>

                    <a
                        href="${metadataURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Metadata JSON
                    </a>

                `;


                /* DEBUG */

                console.log(
                    "GIF CID:",
                    gifCID
                );

                console.log(
                    "Metadata CID:",
                    metadataCID
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

        }
    );

}

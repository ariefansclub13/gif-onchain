const gifInput = document.getElementById("gifInput");
const gifPreview = document.getElementById("gifPreview");
const previewContainer = document.getElementById("previewContainer");
const fileName = document.getElementById("fileName");
const addButton = document.getElementById("addButton");
const result = document.getElementById("result");

let selectedGIF = null;

const WORKER_URL =
    "https://broad-cake-b26b.mochamadarie.workers.dev/upload";


/* =========================
   GIF FILE SELECTION
========================= */

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


/* =========================
   ADD TO COLLECTION
========================= */

if (addButton) {

    addButton.addEventListener(
        "click",
        async function () {

            const gifNameElement =
                document.getElementById("gifName");

            const creatorElement =
                document.getElementById("creator");

            const descriptionElement =
                document.getElementById("description");


            const gifName =
                gifNameElement
                    ? gifNameElement.value.trim()
                    : "";

            const creator =
                creatorElement
                    ? creatorElement.value.trim()
                    : "";

            const description =
                descriptionElement
                    ? descriptionElement.value.trim()
                    : "";


            console.log("FORM DATA:", {
                gifName: gifName,
                creator: creator,
                description: description
            });


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


            /* BUTTON STATE */

            addButton.disabled = true;

            addButton.textContent =
                "Uploading GIF...";

            result.style.display = "block";

            result.textContent =
                "Uploading GIF and metadata to IPFS...";


            try {

                /* =========================
                   CREATE FORM DATA
                ========================= */

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


                /* DEBUG */

                console.log(
                    "Sending data to Worker..."
                );

                console.log(
                    "name:",
                    gifName
                );

                console.log(
                    "creator:",
                    creator
                );

                console.log(
                    "description:",
                    description
                );


                /* =========================
                   SEND TO CLOUDFLARE WORKER
                ========================= */

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
                    "WORKER RESPONSE:",
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


                /* =========================
                   SUCCESS
                ========================= */

                const gifCID =
                    data.gif.cid;

                const metadataCID =
                    data.metadata.cid;


                const gifURL =
                    `https://gateway.pinata.cloud/ipfs/${gifCID}`;


                const metadataURL =
                    `https://gateway.pinata.cloud/ipfs/${metadataCID}`;


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


            } catch (error) {

                console.error(
                    "UPLOAD ERROR:",
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

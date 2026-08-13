const gifInput = document.getElementById("gifInput");
const gifPreview = document.getElementById("gifPreview");
const previewContainer = document.getElementById("previewContainer");
const fileName = document.getElementById("fileName");
const addButton = document.getElementById("addButton");
const result = document.getElementById("result");

let selectedGIF = null;

const WORKER_URL =
    "https://broad-cake-b26b.mochamadarie.workers.dev/upload";


/* ==========================================
   GIF FILE SELECTION
========================================== */

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


/* ==========================================
   ADD GIF TO COLLECTION
========================================== */

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


            /* ==================================
               VALIDATION
            ================================== */

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


            /* ==================================
               BUTTON LOADING STATE
            ================================== */

            addButton.disabled = true;

            addButton.textContent =
                "Uploading GIF...";


            result.style.display = "block";

            result.textContent =
                "Uploading GIF and metadata to IPFS...";


            try {

                /* ==============================
                   CREATE FORM DATA
                ============================== */

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


                /* ==============================
                   SEND TO CLOUDFLARE WORKER
                ============================== */

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
                    "GIF ONCHAIN WORKER RESPONSE:",
                    data
                );


                /* ==============================
                   CHECK WORKER RESPONSE
                ============================== */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Upload failed."
                    );

                }


                /* ==============================
                   GET GIF CID
                ============================== */

                const gifCID =
                    data.gifCID;


                /* ==============================
                   GET METADATA CID
                ============================== */

                const metadataCID =
                    data.metadataCID;


                if (!gifCID) {

                    throw new Error(
                        "GIF CID tidak ditemukan dari Worker."
                    );

                }


                if (!metadataCID) {

                    throw new Error(
                        "Metadata CID tidak ditemukan dari Worker."
                    );

                }


                /* ==============================
                   CREATE IPFS URL
                ============================== */

                const gifURL =
                    `https://gateway.pinata.cloud/ipfs/${gifCID}`;


                const metadataURL =
                    `https://gateway.pinata.cloud/ipfs/${metadataCID}`;


                /* ==============================
                   SUCCESS RESULT
                ============================== */

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

                    <br><br>


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

                    <br><br>


                    <a
                        href="${metadataURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Metadata JSON
                    </a>

                `;


                /* ==============================
                   CONSOLE INFORMATION
                ============================== */

                console.log(
                    "GIF CID:",
                    gifCID
                );


                console.log(
                    "Metadata CID:",
                    metadataCID
                );


                console.log(
                    "GIF IPFS:",
                    gifURL
                );


                console.log(
                    "Metadata IPFS:",
                    metadataURL
                );


            } catch (error) {

                console.error(
                    "GIF ONCHAIN UPLOAD ERROR:",
                    error
                );


                result.textContent =
                    "Upload failed: " +
                    error.message;


            } finally {

                /* ==============================
                   RESTORE BUTTON
                ============================== */

                addButton.disabled = false;

                addButton.textContent =
                    "Add to Collection";

            }

        }
    );

}

const gifInput = document.getElementById("gifInput");
const gifPreview = document.getElementById("gifPreview");
const previewContainer = document.getElementById("previewContainer");
const fileName = document.getElementById("fileName");
const addButton = document.getElementById("addButton");
const result = document.getElementById("result");

let selectedGIF = null;


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

    addButton.addEventListener("click", function () {

        const gifName = document.getElementById("gifName").value.trim();
        const creator = document.getElementById("creator").value.trim();
        const description = document.getElementById("description").value.trim();


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


        const metadata = {

            name: gifName,

            creator: creator,

            description: description,

            fileName: selectedGIF.name,

            fileType: selectedGIF.type,

            createdAt: new Date().toISOString()

        };


        console.log("GIF Metadata:", metadata);


        result.style.display = "block";

        result.textContent =
            "GIF prepared successfully. Metadata has been generated.";

    });

}

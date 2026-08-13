/* =========================================================
   GIF ONCHAIN — COMPLETE SCRIPT
   Upload GIF + Metadata + Mint NFT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const WORKER_URL =
    "https://broad-cake-b26b.mochamadarie.workers.dev/upload";

const CONTRACT_ADDRESS =
    "0x369E7F9B7060211fa52B5009f6025Cd432f436E6";

const BASE_SEPOLIA_CHAIN_ID =
    "0x14a34";


/* =========================================================
   SMART CONTRACT ABI
========================================================= */

const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "metadataURI",
                "type": "string"
            }
        ],
        "name": "mintGIF",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [],
        "name": "nextTokenId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];


/* =========================================================
   LOAD ETHERS
========================================================= */

async function loadEthers() {

    if (window.ethers) {
        return window.ethers;
    }

    return new Promise((resolve, reject) => {

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/ethers@6.13.5/dist/ethers.min.js";

        script.onload = () => {

            if (window.ethers) {
                resolve(window.ethers);
            } else {
                reject(
                    new Error(
                        "Ethers gagal dimuat."
                    )
                );
            }

        };

        script.onerror = () => {

            reject(
                new Error(
                    "Tidak bisa memuat library Ethers."
                )
            );

        };

        document.head.appendChild(script);

    });

}


/* =========================================================
   ELEMENTS
========================================================= */

const gifInput =
    document.getElementById("gifInput");

const gifPreview =
    document.getElementById("gifPreview");

const previewContainer =
    document.getElementById("previewContainer");

const fileName =
    document.getElementById("fileName");

const addButton =
    document.getElementById("addButton");

const result =
    document.getElementById("result");


let selectedGIF = null;


/* =========================================================
   GIF FILE SELECTION
========================================================= */

if (gifInput) {

    gifInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            if (file.type !== "image/gif") {

                alert(
                    "Please select a GIF file."
                );

                this.value = "";

                return;
            }


            selectedGIF = file;


            if (fileName) {
                fileName.textContent =
                    file.name;
            }


            if (gifPreview) {

                const imageURL =
                    URL.createObjectURL(file);

                gifPreview.src =
                    imageURL;

            }


            if (previewContainer) {

                previewContainer.style.display =
                    "block";

            }

        }
    );

}


/* =========================================================
   MAIN BUTTON
========================================================= */

if (addButton) {

    addButton.addEventListener(
        "click",
        async function () {

            /* -------------------------------------------------
               GET FORM VALUES
            ------------------------------------------------- */

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


            /* -------------------------------------------------
               VALIDATION
            ------------------------------------------------- */

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


            /* -------------------------------------------------
               LOADING
            ------------------------------------------------- */

            addButton.disabled =
                true;

            addButton.textContent =
                "Uploading GIF...";


            result.style.display =
                "block";

            result.textContent =
                "Uploading GIF and metadata to IPFS...";


            try {

                /* =================================================
                   STEP 1 — UPLOAD GIF TO WORKER
                ================================================= */

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


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Upload failed."
                    );

                }


                /* =================================================
                   STEP 2 — GET CID
                ================================================= */

                const gifCID =
                    data.gifCID;

                const metadataCID =
                    data.metadataCID;


                if (!gifCID) {

                    throw new Error(
                        "GIF CID tidak ditemukan."
                    );

                }


                if (!metadataCID) {

                    throw new Error(
                        "Metadata CID tidak ditemukan."
                    );

                }


                const gifURL =
                    `https://gateway.pinata.cloud/ipfs/${gifCID}`;


                const metadataURL =
                    `https://gateway.pinata.cloud/ipfs/${metadataCID}`;


                console.log(
                    "GIF CID:",
                    gifCID
                );


                console.log(
                    "Metadata CID:",
                    metadataCID
                );


                /* =================================================
                   STEP 3 — PREPARE METADATA URI
                ================================================= */

                const metadataURI =
                    `ipfs://${metadataCID}`;


                console.log(
                    "Metadata URI:",
                    metadataURI
                );


                /* =================================================
                   STEP 4 — LOAD ETHERS
                ================================================= */

                result.textContent =
                    "Preparing MetaMask...";


                const ethers =
                    await loadEthers();


                /* =================================================
                   STEP 5 — CHECK METAMASK
                ================================================= */

                if (!window.ethereum) {

                    throw new Error(
                        "MetaMask tidak ditemukan. Silakan install MetaMask."
                    );

                }


                /* =================================================
                   STEP 6 — CONNECT WALLET
                ================================================= */

                const provider =
                    new ethers.BrowserProvider(
                        window.ethereum
                    );


                await provider.send(
                    "eth_requestAccounts",
                    []
                );


                const network =
                    await provider.getNetwork();


                console.log(
                    "Current network:",
                    network
                );


                /* =================================================
                   STEP 7 — CHECK BASE SEPOLIA
                ================================================= */

                if (
                    network.chainId !==
                    84532n
                ) {

                    result.textContent =
                        "Switching to Base Sepolia...";


                    try {

                        await window.ethereum.request(
                            {
                                method:
                                    "wallet_switchEthereumChain",

                                params: [
                                    {
                                        chainId:
                                            BASE_SEPOLIA_CHAIN_ID
                                    }
                                ]
                            }
                        );

                    } catch (switchError) {

                        /* -----------------------------------------
                           BASE SEPOLIA NOT ADDED
                        ----------------------------------------- */

                        if (
                            switchError.code ===
                            4902
                        ) {

                            await window.ethereum.request(
                                {
                                    method:
                                        "wallet_addEthereumChain",

                                    params: [
                                        {
                                            chainId:
                                                BASE_SEPOLIA_CHAIN_ID,

                                            chainName:
                                                "Base Sepolia",

                                            nativeCurrency:
                                                {
                                                    name:
                                                        "Ether",

                                                    symbol:
                                                        "ETH",

                                                    decimals:
                                                        18
                                                },

                                            rpcUrls: [
                                                "https://sepolia.base.org"
                                            ],

                                            blockExplorerUrls: [
                                                "https://sepolia.basescan.org"
                                            ]
                                        }
                                    ]
                                }
                            );

                        } else {

                            throw switchError;

                        }

                    }

                }


                /* =================================================
                   STEP 8 — GET SIGNER
                ================================================= */

                const signer =
                    await provider.getSigner();


                const walletAddress =
                    await signer.getAddress();


                console.log(
                    "Wallet:",
                    walletAddress
                );


                /* =================================================
                   STEP 9 — CONTRACT
                ================================================= */

                const contract =
                    new ethers.Contract(
                        CONTRACT_ADDRESS,
                        CONTRACT_ABI,
                        signer
                    );


                /* =================================================
                   STEP 10 — MINT NFT
                ================================================= */

                result.textContent =
                    "Please confirm the mint transaction in MetaMask...";


                console.log(
                    "Minting NFT..."
                );


                const transaction =
                    await contract.mintGIF(
                        walletAddress,
                        metadataURI
                    );


                console.log(
                    "Transaction sent:",
                    transaction.hash
                );


                result.innerHTML = `
                    <strong>Transaction submitted! ⏳</strong>
                    <br><br>
                    Waiting for Base Sepolia confirmation...
                `;


                /* =================================================
                   STEP 11 — WAIT CONFIRMATION
                ================================================= */

                const receipt =
                    await transaction.wait();


                console.log(
                    "Transaction confirmed:",
                    receipt
                );


                /* =================================================
                   STEP 12 — GET TOKEN ID
                ================================================= */

                let tokenId = null;


                try {

                    const nextToken =
                        await contract.nextTokenId();


                    tokenId =
                        nextToken - 1n;

                } catch (tokenError) {

                    console.log(
                        "Could not automatically determine token ID:",
                        tokenError
                    );

                }


                const txHash =
                    receipt.hash;


                const baseScanURL =
                    `https://sepolia.basescan.org/tx/${txHash}`;


                /* =================================================
                   STEP 13 — SUCCESS
                ================================================= */

                result.innerHTML = `

                    <strong>
                        🎉 GIF successfully minted!
                    </strong>

                    <br><br>


                    <strong>
                        Wallet:
                    </strong>

                    <br>

                    ${walletAddress}

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

                    <br><br>


                    ${
                        tokenId !== null
                        ? `
                            <strong>
                                Token ID:
                            </strong>

                            <br>

                            ${tokenId.toString()}

                            <br><br>
                        `
                        : ""
                    }


                    <strong>
                        Transaction:
                    </strong>

                    <br>

                    <a
                        href="${baseScanURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View transaction on BaseScan
                    </a>

                `;


                /* =================================================
                   CONSOLE
                ================================================= */

                console.log(
                    "================================="
                );

                console.log(
                    "GIF MINT SUCCESS"
                );

                console.log(
                    "Wallet:",
                    walletAddress
                );

                console.log(
                    "GIF CID:",
                    gifCID
                );

                console.log(
                    "Metadata CID:",
                    metadataCID
                );

                console.log(
                    "Metadata URI:",
                    metadataURI
                );

                console.log(
                    "Transaction:",
                    txHash
                );

                if (tokenId !== null) {

                    console.log(
                        "Token ID:",
                        tokenId.toString()
                    );

                }

                console.log(
                    "================================="
                );


            } catch (error) {

                console.error(
                    "GIF ONCHAIN ERROR:",
                    error
                );


                let errorMessage =
                    error.message ||
                    "Unknown error.";


                /* -------------------------------------------------
                   FRIENDLY METAMASK ERRORS
                ------------------------------------------------- */

                if (
                    error.code ===
                    4001
                ) {

                    errorMessage =
                        "Transaction dibatalkan di MetaMask.";

                }


                if (
                    error.code ===
                    "ACTION_REJECTED"
                ) {

                    errorMessage =
                        "Transaction dibatalkan di MetaMask.";

                }


                result.innerHTML = `

                    <strong>
                        ❌ Upload / Mint gagal
                    </strong>

                    <br><br>

                    ${errorMessage}

                `;


            } finally {

                addButton.disabled =
                    false;

                addButton.textContent =
                    "Add to Collection";

            }

        }
    );

}

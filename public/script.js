const peer = new Peer(
    `${Math.floor(Math.random() * 2 ** 18)
        .toString(36)
        .padStart(4, 0)}`,
    {
        host: 'deno-webrtc-peer-proxy.deno.dev',
        port: 443,
        debug: 1,
        path: "/myapp",
    },
);

window.peer = peer;


function getLocalStream() {
    navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
            window.localStream = stream; // A
            window.localAudio.srcObject = stream; // B
            window.localAudio.autoplay = true; // C
        })
        .catch((err) => {
            console.error(`you got an error: ${err}`);
        });
}

getLocalStream();

peer.on("open", () => {
    document.getElementById("cast-status").textContent =
        `Your device ID is: ${peer.id}`;
});


const audioContainer = document.querySelector(".call-container");

// Displays the call button and peer ID
function showCallContent() {
    document.getElementById("cast-status").textContent =
        `Your device ID is: ${peer.id}`;
    callBtn.hidden = false;
    audioContainer.hidden = true;
}

// Displays the audio controls and correct copy
function showConnectedContent() {
    document.getElementById("cast-status").textContent = "You're connected";
    callBtn.hidden = true;
    audioContainer.hidden = false;
}

let code;
function getStreamCode() {
    code = window.prompt("Please enter the sharing code");
}
let conn;
function connectPeers() {
    conn = peer.connect(code);
}
peer.on("connection", (connection) => {
    conn = connection;
});
const callBtn = document.querySelector(".call-btn");
callBtn.addEventListener("click", () => {
    getStreamCode();
    connectPeers();
    const call = peer.call(code, window.localStream); // A

    call.on("stream", (stream) => {
        // B
        window.remoteAudio.srcObject = stream;
        window.remoteAudio.autoplay = true;
        window.peerStream = stream;
        showConnectedContent();
    });
});

peer.on("call", (call) => {
    const answerCall = confirm("Do you want to answer?");

    if (answerCall) {
        call.answer(window.localStream); // A
        showConnectedContent(); // B
        call.on("stream", (stream) => {
            // C
            window.remoteAudio.srcObject = stream;
            window.remoteAudio.autoplay = true;
            window.peerStream = stream;
        });
    } else {
        console.log("call denied"); // D
    }
});
const hangUpBtn = document.querySelector(".hangup-btn");
hangUpBtn.addEventListener("click", () => {
    conn.close();
    showCallContent();
});
conn.on("close", () => {
    showCallContent();
});


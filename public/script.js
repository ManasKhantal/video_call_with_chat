const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
const selfVideoBox = document.getElementById('self-video-box')
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myVideoStream
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
}).then(stream => {
    myVideoStream = stream
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
        myVideo.play();
    });
    selfVideoBox.append(myVideo);
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
        }, 1000)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close()
        let totalUsers = document.getElementsByTagName("video").length;
        if (totalUsers >= 1) {
            for (let index = 0; index < totalUsers; index++) {
                document.getElementById('video-grid').getElementsByTagName("video")[index].style.width =
                    1100 / totalUsers + "px";
                document.getElementById('video-grid').getElementsByTagName("video")[index].style.height =
                    900 / totalUsers + "px";
                document.getElementById('video-grid').getElementsByTagName("video")[index].style.borderRadius =
                    5 + "%";
            }
        }
    }
    alert('One or more users left!')
})

while (!userName) {
    var userName = prompt('Enter your name');
};
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, userName)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
        let totalUsers = document.getElementsByTagName("video").length;
        if (totalUsers >= 1) {
            for (let index = 0; index < totalUsers; index++) {
                document.getElementById('video-grid').getElementsByTagName("video")[index].style.width =
                    1100 / totalUsers + "px";
                document.getElementById('video-grid').getElementsByTagName("video")[index].style.height =
                    900 / totalUsers + "px";
                document.getElementById('video-grid').getElementsByTagName("video")[index].style.borderRadius =
                    5 + "%";
            }
        }
    })

    peers[userId] = call
}

function addVideoStream(videoS, stream) {
    videoS.srcObject = stream
    videoS.addEventListener('loadedmetadata', () => {
        videoS.play()
    })
    videoGrid.append(videoS)
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers >= 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementById('video-grid').getElementsByTagName("video")[index].style.width =
                1100 / totalUsers + "px";
            document.getElementById('video-grid').getElementsByTagName("video")[index].style.height =
                900 / totalUsers + "px";
            document.getElementById('video-grid').getElementsByTagName("video")[index].style.borderRadius =
                5 + "%";
        }
    }
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    if (isAudio) {
        document.getElementById("micBtn").className = " fa-solid";
        document.getElementById("micBtn").className += " fa-microphone";
        document.getElementById("micBtn").className += " fa-2xl";
    }
    else {
        document.getElementById("micBtn").className = " fa-solid";
        document.getElementById("micBtn").className += " fa-microphone-slash";
        document.getElementById("micBtn").className += " fa-2xl";
    }
    myVideoStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    if (isVideo) {
        document.getElementById("cameraBtn").className = " fa-solid";
        document.getElementById("cameraBtn").className += " fa-video";
        document.getElementById("cameraBtn").className += " fa-2xl";
    }
    else {
        document.getElementById("cameraBtn").className = " fa-solid";
        document.getElementById("cameraBtn").className += " fa-video-slash";
        document.getElementById("cameraBtn").className += " fa-2xl";
    }
    myVideoStream.getVideoTracks()[0].enabled = isVideo
}
function hangCall() {
    window.location.replace("http://www.google.com");
}
// micBtn.addEventListener('click', function toggleMic() {
//     const initialText = '🎙️ Mic On';

//     if (micBtn.innerText.toLowerCase().includes(initialText.toLowerCase())) {
//         micBtn.innerText = '🎙️ Mic Off';
//     } else {
//         micBtn.innerText = initialText;
//     }
// });

// cameraBtn.addEventListener('click', function toggleCamera() {
//     const initialText = '📷 Camera On';

//     if (cameraBtn.innerText.toLowerCase().includes(initialText.toLowerCase())) {
//         cameraBtn.innerText = '📷 Camera Off';
//     } else {
//         cameraBtn.innerText = initialText;
//     }
// });

var messages = document.getElementById('main_chat_window');
var form = document.getElementById('form');
var input = document.getElementById('input');
input.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
        e.preventDefault();
        sendMsg();
    }
});
function sendMsg() {
    if (input.value) {
        var msg = " " + userName + ": " + input.value
        socket.emit('chat message', msg);
        input.value = '';
    }
}
// form.addEventListener('submit', function (e) {
//     e.preventDefault();
//     if (input.value) {
//         var msg = " " + userName + ": " + input.value
//         socket.emit('chat message', msg);
//         input.value = '';
//     }
// });

socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
refreshTime()
function refreshTime() {
    const timeDisplay = document.getElementById("time");
    const dateString = new Date().toLocaleTimeString();
    timeDisplay.textContent = dateString;
}
setInterval(refreshTime, 1000);

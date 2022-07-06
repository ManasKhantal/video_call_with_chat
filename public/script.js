const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

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
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    myVideoStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    myVideoStream.getVideoTracks()[0].enabled = isVideo
}

micBtn.addEventListener('click', function toggleCamera() {
    const initialText = '🎙️ Mic On';

    if (micBtn.innerText.toLowerCase().includes(initialText.toLowerCase())) {
        micBtn.innerText = '🎙️ Mic Off';
    } else {
        micBtn.innerText = initialText;
    }
});

cameraBtn.addEventListener('click', function toggleCamera() {
    const initialText = '📷 Camera On';

    if (cameraBtn.innerText.toLowerCase().includes(initialText.toLowerCase())) {
        cameraBtn.innerText = '📷 Camera Off';
    } else {
        cameraBtn.innerText = initialText;
    }
});

var messages = document.getElementById('main_chat_window');
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

const socket = io();
/**
 * Video Part
 */
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOn = false;
let roomName;
let myPeerConnection; // so that it's accessible everywhere
let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCam = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCam.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  try {
    const initialConstraints = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}
getMedia();

function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  // console.log(myStream.getAudioTracks());
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!cameraOn) {
    cameraBtn.innerText = "Turn Cam Off";
    cameraOn = true;
  } else {
    cameraBtn.innerText = "Turn Cam On";
    cameraOn = false;
  }
}

async function handleCameraChange() {
  await getMedia(cameraSelect.value); // id

  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0]; // newly created stream (2 lines above!)
    console.log(myPeerConnection.getSenders());
    const videoSenders = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSenders.replaceTrack(videoTrack);
    console.log(videoSenders);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await startMedia();
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
socket.on("welcome", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => {
    console.log(event);
    console.log(event.data);
  }); // myDataChannel on Peer A
  console.log("made data channel");
  console.log("Somebody joined");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName); // sending the offer to  roomName (via the server)
}); //runs on Peer A, after Peer B joins

socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) => {
      console.log(event);
      console.log(event.data);
    }); // myDataChannel on Peer B
  });
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
}); //runs on Peer B

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  console.log(myStream.getTracks());
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("sent candidate");

  // console.log("got ice candidate");
  // console.log(data);
}

function handleAddStream(data) {
  const peerStream = document.getElementById("peerStream");
  console.log("got a stream from peer");
  console.log("Peer's stream", data.stream);
  console.log("My Stream", myStream);

  peerStream.srcObject = data.stream;
}

/**
 * Chat Part
 */
// const welcome = document.querySelector("#welcome");
// const room = document.querySelector("#room");
// const form = welcome.querySelector("form");
// room.hidden = true;
// let roomName;

// function handleMessageSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("input");

//   const value = input.value;
//   socket.emit("new_message", value, roomName, () => {
//     addMessage(`You: ${value}`);
//   }); // emitting an event to the backend

//   input.value = "";
// }

// function showRoom() {
//   welcome.hidden = true;
//   room.hidden = false;
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName}`;
//   const messageForm = room.querySelector("#message");

//   messageForm.addEventListener("submit", handleMessageSubmit);
// }

// function addMessage(message) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = message;
//   ul.appendChild(li);
// }

// function handleRoomSubmit(event) {
//   event.preventDefault();
//   const nickname = welcome.querySelector("#nickname ");
//   socket.emit("nickname", nickname.value);

//   const input = form.querySelector("#roomname");
//   roomName = input.value;
//   socket.emit("enter_room", roomName, showRoom); // more than just a message. can transfer multiple data, in many various types
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (nickname, newCount) => {
//   addMessage(`${nickname} has joined the room!`);

//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
// });

// socket.on("bye", (nickname, newCount) => {
//   addMessage(`${nickname} has left the room!`);

//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
// });

// socket.on("new_message", addMessage);

// socket.on("room_change", (publicRooms) => {
//   const roomListContainer = welcome.querySelector("ul");
//   roomListContainer.innerHTML = "";

//   if (publicRooms.length === 0) {
//     return;
//   }
//   publicRooms.forEach((room) => {
//     const li = document.createElement("li");
//     li.innerText = room;

//     roomListContainer.append(li);
//   });
// });

// const messageList = document.querySelector("ul");
// const nicknameForm = document.querySelector("#nickname");
// const messageForm = document.querySelector("#message");
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//   const msg = { type, payload };

//   return JSON.stringify(msg);
// }

// socket.addEventListener("open", () => {
//   console.log("Connected to Server ✔");
// });

// socket.addEventListener("message", (message) => {
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   messageList.append(li);
//   console.log("New message: ", message.data);
// });

// socket.addEventListener("close", () => {
//   console.log("Disconnected from Server ✔");
// });

// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(makeMessage("new_message", input.value));
//   input.value = "";
// }

// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = nicknameForm.querySelector("input");
//   socket.send(makeMessage("nickname", input.value));
//   input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nicknameForm.addEventListener("submit", handleNicknameSubmit);

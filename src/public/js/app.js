const socket = io();

/**
 * Video Part
 */
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");

const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOn = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}
getMedia();

function handleMuteClick() {
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  if (!cameraOn) {
    cameraBtn.innerText = "Turn Cam Off";
    cameraOn = true;
  } else {
    cameraBtn.innerText = "Turn Cam On";
    cameraOn = false;
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

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

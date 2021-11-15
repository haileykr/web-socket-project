import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit(answer);
  });
});

const handleListen = () => {
  console.log("Listening on Port #3000...");
};

httpServer.listen(3000, handleListen);

// SOCKET.IO PART
// import http from "http";
// // import WebSocket from "ws";
// // import SocketIO from "socket.io";
// import { Server } from "socket.io";
// import { instrument } from "@socket.io/admin-ui";
// import express from "express";

// const app = express();

// app.set("view engine", "pug");
// app.set("views", __dirname + "/public/views");

// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.redirect("/"));

// const handleListen = () => {
//   console.log("Listening on Port #3000...");
// };
// const httpServer = http.createServer(app); //http server
// // const wss = new WebSocket.Server({ httpServer }); //wss +http on the same port!
// // const io = SocketIO(httpServer);
// const io = new Server(httpServer, {
//   cors: {
//     origin: ["https://admin.socket.io"],
//     credentials: true,
//   },
// });
// instrument(io, {
//   auth: false,
// });

// function publicRooms() {
//   const {
//     sockets: {
//       adapter: { sids, rooms },
//     },
//   } = io;
//   const publicRooms = [];

//   rooms.forEach((_, key) => {
//     if (sids.get(key) === undefined) {
//       publicRooms.push(key);
//     }
//   });
//   return publicRooms;
// }

// function countRoom(roomName) {
//   return io.sockets.adapter.rooms.get(roomName)?.size;
// }

// io.on("connection", (socket) => {
//   io.sockets.emit("room_change", publicRooms());

//   socket.onAny((event) => {
//     // like a logger
//     console.log(`Socket Event: ${event}`);
//   });
//   socket.on("enter_room", (roomName, done) => {
//     socket.join(roomName);
//     done();

//     socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//     io.sockets.emit("room_change", publicRooms());
//   });
//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) =>
//       socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
//     );
//   });
//   socket.on("disconnect", () => {
//     io.sockets.emit("room_change", publicRooms());
//   });
//   socket.on("new_message", (message, roomName, done) => {
//     socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
//     done();
//   });
//   socket.on("nickname", (nickname) => {
//     socket["nickname"] = nickname;
//   });
// }); //ready to receive connection on backend

// // const sockets = []; //fake database
// // wss.on("connection", (socket) => {
// //   // listening to "connection" event
// //   // console.log(socket)
// //   sockets.push(socket);
// //   socket["nickname"] = "anonymous";
// //   console.log("Connected to Browser ✔");
// //   socket.on("close", () => console.log("Disconnected from Browser ✔"));
// //   socket.on("message", (message) => {
// //     const parsedMessage = JSON.parse(message);
// //     switch (parsedMessage.type) {
// //       case "new_message":
// //         sockets.forEach((aSocket) =>
// //           aSocket.send(`${socket.nickname}: ${parsedMessage.payload}`)
// //         );
// //         break;
// //       case "nickname":
// //         socket["nickname"] = parsedMessage.payload; // socket is an object
// //         break;
// //     }
// //   });
// //   socket.send("hello!");
// // });

// httpServer.listen(3000, handleListen);

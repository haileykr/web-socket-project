import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => {
  console.log("Listening on Port #3000...");
};
const httpServer = http.createServer(app); //http server
// const wss = new WebSocket.Server({ httpServer }); //wss +http on the same port!
const io = SocketIO(httpServer);

io.on("connection", (socket) => {
  socket.onAny((event) => {
    // like a logger
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", message);
    done();
  });
}); //ready to receive connection on backend

// const sockets = []; //fake database
// wss.on("connection", (socket) => {
//   // listening to "connection" event
//   // console.log(socket)
//   sockets.push(socket);
//   socket["nickname"] = "anonymous";
//   console.log("Connected to Browser ✔");
//   socket.on("close", () => console.log("Disconnected from Browser ✔"));
//   socket.on("message", (message) => {
//     const parsedMessage = JSON.parse(message);
//     switch (parsedMessage.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${parsedMessage.payload}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = parsedMessage.payload; // socket is an object
//         break;
//     }
//   });
//   socket.send("hello!");
// });

httpServer.listen(3000, handleListen);

import http from "http";
import WebSocket from "ws";
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

const server = http.createServer(app); //http server
const wss = new WebSocket.Server({ server }); //wss +http on the same port!

wss.on("connection", (socket) => { // listening to "connection" event
  // console.log(socket)
  console.log("Connected to Browser ✔");
  socket.on("close", () => console.log("Disconnected from Browser ✔"));
  socket.on("mesage", (message) => {
    console.log(message);
  });
  socket.send("hello!");
});

server.listen(3000, handleListen);

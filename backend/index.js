const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const config = require("./src/config");

const OrderingSession = require("./src/OrderingSession");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

const rootDir = path.resolve("../");
app.use(express.static(path.join(rootDir, "frontend", "dist")));

app.get("/", (req, res) => {
	res.sendFile(path.join(rootDir, "frontend", "dist", "index.html"));
});


io.on("connection", (socket) => {
  console.log("a user connected");

  const orderingSession = new OrderingSession(socket);

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

server.listen(config.PORT, () => {
	console.log(`listening on *:${config.PORT}`);
});

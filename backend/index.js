const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const config = require("./src/config");

const sessionMiddleware = require("./src/middleware/session");
const { wrap, corsConfig } = require("./src/controllers/server.controller");
const OrderingSession = require("./src/OrderingSession");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: corsConfig,
});

app.use(cors(corsConfig));
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				"script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
				"style-src": ["'self'", "'unsafe-inline'"],
				"default-src": ["'self'", "data:"],
			},
		},
	})
);
app.use(express.json());

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
	console.log("a user connected: ", socket.id);

	if (!socket.request.session.isUserDataInitialized) {
		socket.request.session.isUserDataInitialized = true;
		socket.request.session.userData = {
			orderStatus: null,
			order: [],
			orders: [],
		};
    socket.request.session.save();
	}

	const orderingSession = new OrderingSession(socket);

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

const rootDir = path.resolve("../");
app.use(express.static(path.join(rootDir, "frontend", "src", "dist")));

app.get("/", (req, res) => {
	res.sendFile(path.join(rootDir, "frontend", "src", "dist", "index.html"));
});

server.listen(config.PORT, () => {
	console.log(`listening on *:${config.PORT}`);
});

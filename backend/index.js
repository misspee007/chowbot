const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const database = require("./src/database/db");
const sessionMiddleware = require("./src/middleware/session");
const config = require("./src/config");
const { corsConfig, wrap } = require("./src/controllers/server.controller");
const OrderingSession = require("./src/components/OrderingSession");

const server = http.createServer(app);
const io = new Server(server, {
	cors: corsConfig,
});

io.use(wrap(sessionMiddleware));

// connect to database
database.connect(config.MONGODB_URI);

io.on("connection", (socket) => {
	console.log("a user connected: ", socket.id);

	const orderingSession = new OrderingSession(socket);

	// save message to database
	socket.on("saveMsg", ({ message, isBot }) => {
		orderingSession
			.saveMsg(message, isBot)
			.then(() => {
				console.log("chat saved");
			})
			.catch((err) => {
				console.log("Error saving chat history: ", err);
				throw new Error(err);
			});
	});

	// handle errors
	socket.on("error", (err) => {
		throw new Error(err);
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

server.listen(config.PORT, () => {
	console.log(`listening on port ${config.PORT}`);
});

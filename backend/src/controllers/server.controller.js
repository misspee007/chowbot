const config = require("../config");

const corsConfig = {
	origin: [config.CLIENT_URL, `http://localhost:${config.PORT}`],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	credentials: true,
};

const wrap = (middleware) => (socket, next) =>
	middleware(socket.request, {}, next);

module.exports = { corsConfig, wrap };

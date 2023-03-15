const config = require("../config");

const wrap = (expressMiddleware) => (socket, next) =>
	expressMiddleware(socket.request, {}, next);

const corsConfig = {
	origin: config.CLIENT_URL,
	credentials: true,
};

module.exports = { wrap, corsConfig };

const helmet = require("helmet");
const config = require("../config");

const corsConfig = {
	origin: [config.CLIENT_URL, `http://localhost:${config.PORT}`],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	credentials: true,
	allowedHeaders: [
		"Access-Control-Allow-Headers",
		"Origin",
		"Accept",
		"X-Requested-With",
		"Content-Type",
		"Access-Control-Request-Method",
		"Access-Control-Request-Headers",
	],
};

const wrap = (middleware) => (socket, next) =>
	middleware(socket.request, socket.request.res, next);

const helmetConfig = {
	contentSecurityPolicy: {
		...helmet.contentSecurityPolicy.getDefaultDirectives(),
		defaultSrc: ["'self'", `${config.CLIENT_URL}`],
	},
};

module.exports = { corsConfig, helmetConfig, wrap };

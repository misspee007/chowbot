const config = require("../config");

const corsConfig = {
	origin: config.CLIENT_URL,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

module.exports = { corsConfig };

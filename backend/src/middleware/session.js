const session = require("express-session");
const MongoStore = require("connect-mongo");
const config = require("../config");

const sess = {
	name: "chowbot",
	secret: config.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	store: MongoStore.create({
		mongoUrl: config.MONGODB_URI,
	}),
	cookie: {
		name: "chowbot",
		maxAge: config.COOKIE_MAX_AGE,
	},
};

if (process.env.NODE_ENV === "production") {
	sess.cookie.secure = true;
	sess.cookie.httpOnly = true;
	sess.cookie.domain = config.COOKIE_DOMAIN;
}

module.exports = session(sess);

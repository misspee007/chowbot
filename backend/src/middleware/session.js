const session = require("express-session");
const config = require("../config");
const MongoStore = require("connect-mongo");

const sess = {
  name: "chowbot",
	secret: config.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
    // domain: "localhost",
    maxAge: config.COOKIE_MAX_AGE,
    secure: true,
    httpOnly: true,
    sameSite: "none",
  },
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URI,
  }),
};

if(process.env.NODE_ENV === "production") {
  sess.cookie.secure = true;
  sess.cookie.httpOnly = true;
}

module.exports = session(sess);
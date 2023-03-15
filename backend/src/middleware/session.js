const session = require("express-session");
const config = require("../config");
const MongoStore = require("connect-mongo");

const sess = {
  name: "chowbot",
	secret: config.SESSION_SECRET,
	resave: true,
	saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URI,
  }),
	cookie: {
    name: "chowbot",
    domain: config.DOMAIN,
    maxAge: config.COOKIE_MAX_AGE,
    secure: false,
    httpOnly: false,
  },
};

if(process.env.NODE_ENV === "production") {
  sess.cookie.secure = true;
  sess.cookie.httpOnly = true;
}

module.exports = session(sess);
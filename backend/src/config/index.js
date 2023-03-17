const path = require("path");
require("dotenv").config({ path: path.join(path.resolve("../"), ".env") });

const CONFIG = {
	PORT: process.env.PORT || 3399,
  NODE_ENV: process.env.NODE_ENV,
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_MAX_AGE: eval(process.env.COOKIE_MAX_AGE),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  MONGODB_URI: process.env.MONGODB_URI,
  SENTRY_DSN: process.env.SENTRY_DSN,
  CLIENT_URL: process.env.CLIENT_URL,
};

module.exports = CONFIG;

const path = require("path");
require("dotenv").config({ path: path.join(path.resolve("../"), ".env") });

const CONFIG = {
	PORT: process.env.PORT,
};

module.exports = CONFIG;

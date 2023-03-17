const express = require("express");
const Sentry = require("@sentry/node");
const initializeSentry = require("./src/middleware/sentry");
const path = require("path");
const cookieParser = require("cookie-parser");

const sessionMiddleware = require("./src/middleware/session");

const app = express();

// logging middleware
const SentryInit = initializeSentry(app);
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.set("trust proxy", 1);
app.use(sessionMiddleware);
app.use(cookieParser());

const rootDir = path.resolve("../");
app.use(express.static(path.join(rootDir, "frontend", "src", "dist")));

app.get("/", (req, res) => {
	res.status(200).sendFile(path.join(rootDir, "frontend", "src", "dist", "index.html"));
});

// To test logger
app.get("/debug-sentry", function mainHandler(req, res) {});

// Error handler. Logs all errors to Sentry
app.use(
	Sentry.Handlers.errorHandler({
		shouldHandleError(error) {
			return true;
		},
	})
);

// Fallback error handler
app.use(function onError(err, req, res, next) {
	res.statusCode = 500;
	res.end(res.sentry + "\n");
  console.log("error: ", err);
});

module.exports = app;
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const config = require('../config');

function initializeSentry(app) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
      // enable Socket.io tracing
    ],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 1.0,
  });

  return Sentry;
}

module.exports = initializeSentry;


const config = require('./config');

// Raven.config(config.ravenUrl).install();

window.onerror = function(message, source, lineno, colno, error) {
    Raven.captureException(error, {extra: {stack: error.stack}});
}

window.addEventListener('unhandledrejection', function(event) {
    Raven.captureException(event.reason, {extra: {stack: event.reason.stack}});
});
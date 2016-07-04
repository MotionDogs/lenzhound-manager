module.exports = {
    logError(err) {
        if (err) {
            console.error(err);
            if (err.stack) {
                console.log(err.stack);
            } else {
                console.log("(no stack trace)");
            }
        } else {
            console.error("An unknown error occurred.");
        }

        throw err;
    }
};
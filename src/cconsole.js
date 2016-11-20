var hash = require('string-hash');

module.exports = {
    log(key, str) {
        var color = hash(key) & 0x00ffffff;
        var colorStr = color.toString(16);
        console.log("%c" + str, `color:#${colorStr}`);
    },
};
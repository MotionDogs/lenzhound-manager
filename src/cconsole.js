const hash = require('string-hash');

module.exports = {
    log(key, str) {
        const color = hash(key) & 0x00ffffff;
        const colorStr = color.toString(16);
        console.log("%c" + str, `color:#${colorStr}`);
    },
};
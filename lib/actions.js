'use strict';

var root;
var getRoot = function getRoot() {
    return root = root || require('./root');
};

module.exports = {
    setStartInCal: function setStartInCal(val) {
        getRoot().setState({ settings: { startInCal: val } });
    }
};
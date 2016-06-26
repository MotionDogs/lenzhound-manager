var ee = require('event-emitter');
var events = ee({});

events.SERIAL_PORT_OPEN = "SERIAL_PORT_OPEN";
events.SERIAL_PORT_CLOSE = "SERIAL_PORT_CLOSE";
events.SET_START_IN_CAL = "SET_START_IN_CAL";
events.SET_MAX_VELOCITY = "SET_MAX_VELOCITY";
events.SET_ACCEL = "SET_ACCEL";
events.RESPONSE_OUTPUT = (val) => "RESPONSE_OUTPUT:" + val;

module.exports = events;

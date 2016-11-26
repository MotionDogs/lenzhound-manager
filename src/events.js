var ee = require('event-emitter');
var events = ee({});

events.SERIAL_PORT_OPEN = "SERIAL_PORT_OPEN";
events.SERIAL_PORT_CLOSE = "SERIAL_PORT_CLOSE";

events.UPDATE_PROFILE = "UPDATE_PROFILE";

events.UPLOAD_TO_TXR = "UPLOAD_TO_TXR";
events.UPLOAD_TO_RXR = "UPLOAD_TO_RXR";
events.FORCE_UPLOAD_RXR = "FORCE_UPLOAD_RXR";
events.FORCE_UPLOAD_TXR = "FORCE_UPLOAD_TXR";

events.LIST_PROFILES = "LIST_PROFILES";
events.PROFILE_SELECTED = "PROFILE_SELECTED";
events.PROFILE_MOUSEOVER = "PROFILE_MOUSEOVER";
events.PROFILE_MOUSEOUT = "PROFILE_MOUSEOUT";

events.LED_ON = "LED_ON";
events.LED_OFF = "LED_OFF";

events.RESPONSE_OUTPUT = (val) => "RESPONSE_OUTPUT:" + val;
events.RESPONSE_OK = (val) => "RESPONSE_OK:" + val;


module.exports = events;

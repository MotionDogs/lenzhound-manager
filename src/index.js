const React = require('react');
const ReactDOM = require('react-dom');
const app = require('./lib/app-root');
const events = require('./lib/events');
const api = require('./lib/serial-api');
const remoteFileApi = require('./lib/remote-file-api');
const _ = require('lodash');
require('./lib/error-logger');

const CONFIG_DEBOUNCE_MILLISECONDS = 1000;
const PAW_BUTTON_COUNT = 4;

const poll = (period, lambda) => {
    var interval = setInterval(() => {
        lambda(() => {
            clearInterval(interval);
        });
    }, period);
    return interval;
}

const mergeProfile = (profileId, settings) => {
    var props = app.getProps();
    var index = props.settings.findIndex(p => p.profileId === profileId);
    var oldSettings = props.settings[index];
    var profiles = props.settings.slice(0, index)
        .concat([Object.assign({}, oldSettings, settings)])
        .concat(props.settings.slice(index+1));
    var newProps = Object.assign({}, props, {settings:profiles});
    app.setProps(newProps);
};

const wait = (time) => {
    return new Promise((ok,err) => setTimeout(() => ok(), time));
};

let profileId = null;
let profiles = null;

events.on(events.SERIAL_PORT_OPEN, () => {

    poll(1000, stop => api.getRole().then(result => {

        app.setProps({
            unknownVersion: false,
            pawPluggedIn: result === "PAW",
            dogbonePluggedIn: result === "DOGBONE",
            settings: []
            // settings: {
            //     profileId: 2,
            //     startInCal: false,
            //     maxSpeed: 24,
            //     accel: 31,
            //     channel: 5
            // }
        });


        if (result === "PAW") {

            remoteFileApi.getLaterTxrVersionIfExists().then(v => {

                if (v) {
                    app.setProps({newTxrVersion: v || null, unknownVersion: false});
                }
                
                var getSettingsRecursive = (settings,index) => (index < PAW_BUTTON_COUNT) ?
                    api.setPresetIndex(index).then(() => wait(10).then(() =>
                    api.getId().then(profileId => wait(10).then(() =>
                    api.getStartInCal().then(startInCal => wait(10).then(() =>
                    api.getMaxSpeed().then(maxSpeed =>  wait(10).then(() =>
                    api.getAccel().then(accel => wait(10).then(() =>
                    api.getChannel().then(channel => wait(10).then(() =>
                    api.getName().then(profileName => wait(10).then(() => {

                        settings.push({
                            profileId,
                            profileName,
                            startInCal,
                            maxSpeed,
                            accel,
                            channel,
                        });

                        return getSettingsRecursive(settings, index + 1)
                    })))))))))))))) : settings;

                api.getPresetIndex().then(index => {
                    getSettingsRecursive([],0).then((settings) => {
                        profiles = settings;
                        api.setPresetIndex(index).then(() => {
                            app.setProps({ settings });
                        });
                    });
                });
            });

        } else if (result === "DOGBONE") {

            remoteFileApi.getLaterRxrVersionIfExists().then(v => {

                if (v) {
                    app.setProps({newRxrVersion: v || null, unknownVersion: false});
                }

                api.getChannel().then(channel => {
                    app.setProps({
                        profileId: 1,
                        settings: [{
                            profileId: 1,
                            profileName: null,
                            startInCal: null,
                            maxSpeed: null,
                            accel: null,
                            channel,
                        }]
                    });
                });
            });

        } else {
            app.setProps({unknownVersion: true});
        }

        stop();
    }, err => {
        app.setProps({unknownVersion: true});
    }));
});

events.on(events.SERIAL_PORT_CLOSE, () => {
    app.setProps({pawPluggedIn: false, dogbonePluggedIn: false});
});

const saveConfigsDebounced = _.debounce(() =>
    api.saveConfigs(), CONFIG_DEBOUNCE_MILLISECONDS);

events.on(events.UPDATE_PROFILE, (payload) => {
    const {
        profileId,
        maxSpeed,
        accel,
        channel,
        profileName,
        startInCal
    } = payload;

    if (maxSpeed) {
        mergeProfile(profileId, {maxSpeed});
        api.setMaxSpeed(maxSpeed);
        saveConfigsDebounced();   
    }
    if (accel) {
        mergeProfile(profileId, {accel});
        api.setAccel(accel);
        saveConfigsDebounced();
    }
    if (channel) {
        mergeProfile(profileId, {channel});
        api.setChannel(channel);
    }
    if (profileName) {
        mergeProfile(profileId, {profileName});
        api.setName(profileName);
    }
    if (startInCal === false || startInCal === true) {
        mergeProfile(profileId, {startInCal});
        api.setStartInCal(startInCal);
    }
});

events.on(events.UPLOAD_TO_TXR, (version) => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    api.flashBoard(version.url).then(() => {
        app.setProps({loading: false});
        api.enableAutoConnect();
    });
});

events.on(events.UPLOAD_TO_RXR, (version) => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    api.flashBoard(version.url).then(() => {
        app.setProps({loading: false});
        api.enableAutoConnect();
    });
});

events.on(events.FORCE_UPLOAD_TXR, () => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    remoteFileApi.getLaterTxrVersionIfExists().then(version => {
        api.flashBoard(version.url).then(() => {
            app.setProps({loading: false});
            api.enableAutoConnect();
        });;
    });
});

events.on(events.FORCE_UPLOAD_RXR, () => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    remoteFileApi.getLaterRxrVersionIfExists().then(version => {
        api.flashBoard(version.url).then(() => {
            app.setProps({loading: false});
            api.enableAutoConnect();
        });
    });
});

events.on(events.RESPONSE_OUTPUT("*"), (val) => {
});

events.on(events.LIST_PROFILES, () => {
    app.setProps({profileId: null});
});

events.on(events.PROFILE_SELECTED, val => {
    profileId = val;
    var props = app.getProps();
    var index = props.settings.findIndex(p => p.profileId === val);
    if (index != -1 && index < 4) {
        api.setPresetIndex(index).then(() =>
        api.reloadConfigs().then(() => {
            app.setProps({profileId: val});
        }));
    } else {
        app.setProps({profileId: val});
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_PRESET_INDEX), val => {
    if (profiles) {
        var index = parseInt(val);
        profileId = profiles[index].profileId;
        events.emit(events.PROFILE_SELECTED, profileId);
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_MAX_VELOCITY), val => {
    var maxSpeed = parseInt(val);
    var {settings, profileId} = app.getProps();
    if (settings && profileId) {
        var index = settings.findIndex(p => p.profileId === profileId);
        if (index != -1) { 
            settings[index].maxSpeed = maxSpeed;
            app.setProps({settings});   
        }
    }
});

app.setProps({pawPluggedIn:false, settings: []});

api.enableAutoConnect();

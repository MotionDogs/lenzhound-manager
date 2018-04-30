const React = require('react');
const { ipcRenderer } = require('electron');
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
    const props = app.getProps();
    const index = props.settings.findIndex(p => p.profileId === profileId);
    const oldSettings = props.settings[index];
    const profiles = props.settings.slice(0, index)
        .concat([Object.assign({}, oldSettings, settings)])
        .concat(props.settings.slice(index+1));
    const newProps = Object.assign({}, props, {settings:profiles});
    app.setProps(newProps);
};

const wait = (time) => {
    return new Promise((ok,err) => setTimeout(() => ok(), time));
};

events.on(events.SERIAL_PORT_OPEN, () => {
    poll(1000, async stop => {
        let role;
        try {
            role = await api.getRole();
        } catch (e) {
        }

        if (role === "PAW") {
            const newVersion = await remoteFileApi.getLaterTxrVersionIfExists();

            app.setProps({
                badVersion: !!newVersion,
                pawPluggedIn: true,
                settings: [],
                loading: false,
                profileId: null,
            });

            await wait(10);
            const index = await api.getPresetIndex();
            await wait(10);
            const startInCal = await api.getStartInCal();
            await wait(10);
            const channel = await api.getChannel();

            const settings = [];
            for (let i = 0; i < PAW_BUTTON_COUNT; i++) {
                await wait(10);
                await api.setPresetIndex(i);

                await wait(10);
                const profileId = await api.getId();
                await wait(10);
                const maxSpeed = await api.getMaxSpeed();
                await wait(10);
                const accel = await api.getAccel();
                await wait(10);
                const profileName = await api.getName();
                await wait(10);
                const currentLevel = await api.getCurrentLevel();

                settings.push({
                    profileId,
                    profileName,
                    maxSpeed,
                    accel,
                    currentLevel,
                });
            }

            await api.setPresetIndex(index);
            app.setProps({ startInCal, channel, settings });
        } else if (role === "DOGBONE") {

            const newVersion = await remoteFileApi.getLaterRxrVersionIfExists();

            app.setProps({
                badVersion: !!newVersion,
                dogbonePluggedIn: true,
                settings: [],
                loading: false,
            });

            const channel = await api.getChannel();
            const motorDriver = await api.getMotorDriver();

            app.setProps({
                profileId: 1,
                channel,
                motorDriver,
                startInCal: null,
                settings: [{
                    profileId: 1,
                    profileName: null,
                    maxSpeed: null,
                    accel: null,
                    currentLevel: null,
                }]
            });

        } else {
            app.setProps({badVersion: true, loading: false});
        }

        stop();
    }, err => {
        app.setProps({badVersion: true, loading: false});
    });
});

events.on(events.SERIAL_PORT_CLOSE, () => {
    app.setProps({pawPluggedIn: false, dogbonePluggedIn: false});
});

const saveConfigsDebounced = _.debounce(() =>
    api.saveConfigs(), CONFIG_DEBOUNCE_MILLISECONDS);

const updateChannelDebounced = _.debounce((c) => api.setChannel(c), 200);

events.on(events.UPDATE_CHANNEL, (channel) => {
    updateChannelDebounced(channel);
    app.setProps({channel});
});

events.on(events.UPDATE_START_IN_CAL, (startInCal) => {
    api.setStartInCal(startInCal);
    app.setProps({startInCal});
});

events.on(events.UPDATE_MOTOR_DRIVER, (motorDriver) => {
    api.setMotorDriver(motorDriver);
    app.setProps({motorDriver});
});

events.on(events.UPDATE_PROFILE, (payload) => {
    const {
        profileId,
        maxSpeed,
        accel,
        currentLevel,
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
    if (currentLevel === false || currentLevel === true) {
        mergeProfile(profileId, {currentLevel});
        api.setCurrentLevel(currentLevel);
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

events.on(events.FORCE_UPLOAD_TXR, async () => {
    api.disableAutoConnect();
    app.setProps({loading: true});

    const latest = await remoteFileApi.forceGetLatestTxrVersion();
    await api.flashBoard(latest.url);

    api.enableAutoConnect();
});

events.on(events.FORCE_UPLOAD_RXR, async () => {
    api.disableAutoConnect();
    app.setProps({loading: true});

    const latest = await remoteFileApi.forceGetLatestRxrVersion();
    await api.flashBoard(latest.url);

    api.enableAutoConnect();
});

events.on(events.RESPONSE_OUTPUT("*"), (val) => {
});

events.on(events.LIST_PROFILES, () => {
    app.setProps({profileId: null});
});

events.on(events.PROFILE_SELECTED, async val => {
    const props = app.getProps();
    const index = props.settings.findIndex(p => p.profileId === val);
    if (index != -1 && index < 4) {
        await api.setPresetIndex(index);
        await api.reloadConfigs();

        app.setProps({profileId: val});
    } else {
        app.setProps({profileId: val});
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_PRESET_INDEX), val => {
    const profiles = app.getProps().settings;
    if (profiles && profiles.length) {
        const index = parseInt(val);
        const {profileId} = profiles[index];
        events.emit(events.PROFILE_SELECTED, profileId);
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_LED), val => {
    const parsed = parseInt(val);
    const status = (parsed >> 8) & 0xff;
    const led = parsed & 0xff;

    if (status == api.ledStates.OFF) {
        events.emit(events.LED_OFF, led);
    } else if (status == api.ledStates.ON) {
        events.emit(events.LED_ON, led);
    } else {
        throw new Error("Unexpected LED status change")
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_MAX_VELOCITY), val => {
    const maxSpeed = parseInt(val);
    const {settings, profileId} = app.getProps();
    if (settings && profileId) {
        const index = settings.findIndex(p => p.profileId === profileId);
        if (index != -1) {
            settings[index].maxSpeed = maxSpeed;
            app.setProps({settings});
        }
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_ACCEL), val => {
    const accel = parseInt(val);
    const {settings, profileId} = app.getProps();
    if (settings && profileId) {
        const index = settings.findIndex(p => p.profileId === profileId);
        if (index != -1) {
            settings[index].accel = accel;
            app.setProps({settings});
        }
    }
});

events.on(events.RESPONSE_OUTPUT(api.types.GET_CURRENT_LEVEL), val => {
    const currentLevel = parseInt(val);
    const {settings, profileId} = app.getProps();
    if (settings && profileId) {
        const index = settings.findIndex(p => p.profileId === profileId);
        if (index != -1) {
            settings[index].currentLevel = currentLevel;
            app.setProps({settings});
        }
    }
});

events.on(events.LOCAL_BUILD_CHANGED, async () => {
    const ourMode = app.getProps().pawPluggedIn ? "Txr" : "Rxr";
    const version = await remoteFileApi[`getLater${ourMode}VersionIfExists`]();

    if (version) {
        app.setProps({badVersion: true});
    }
});

events.on(events.SKIP_UPLOADING, () => {
    app.setProps({badVersion: false});
});

app.setProps({pawPluggedIn:false, settings: []});

api.enableAutoConnect();

remoteFileApi.watchForLocalBuildChanges();

ipcRenderer.on("reset-settings", async () => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    try {
        await api.factoryReset();
    } catch (e) {
    }
    api.enableAutoConnect();
});

ipcRenderer.on("reset-to-stable", async () => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    try {
        await api.resetToStable();
    } catch (e) {
    }
    api.enableAutoConnect();
});

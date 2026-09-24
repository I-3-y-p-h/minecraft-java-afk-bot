const { createMinecraftBot } = require("./client");
const { registerMinecraftEvents } = require("./events");
const { getMinecraftConfig, getReconnectConfig } = require("../config");
const { log } = require("../logger");

let bot = null;
let reconnectTimer = null;
let callbacks = {};
let autoReconnect = getReconnectConfig().enabled;
const manualDisconnects = new WeakSet();

function connect(nextCallbacks = {}) {
    callbacks = { ...callbacks, ...nextCallbacks };
    if (bot) {
        log.info("Der Minecraft-Bot ist bereits verbunden oder verbindet sich gerade.");
        return bot;
    }

    clearReconnectTimer();
    const minecraft = getMinecraftConfig();
    log.login(`Verbinde zu ${minecraft.host}:${minecraft.port}.`);

    const currentBot = createMinecraftBot(minecraft);
    bot = currentBot;
    registerMinecraftEvents(currentBot, callbacks);

    currentBot.once("end", () => {
        if (bot === currentBot) bot = null;

        if (manualDisconnects.has(currentBot)) {
            manualDisconnects.delete(currentBot);
            log.info("Die Minecraft-Verbindung wurde manuell beendet.");
            return;
        }

        scheduleReconnect(false);
    });

    return currentBot;
}

function disconnect() {
    clearReconnectTimer();
    if (!bot) {
        log.info("Der Minecraft-Bot ist bereits offline.");
        return;
    }

    const currentBot = bot;
    bot = null;
    manualDisconnects.add(currentBot);
    log.info("Minecraft-Verbindung wird beendet.");
    currentBot.quit();
}

function reconnect(nextCallbacks = {}) {
    callbacks = { ...callbacks, ...nextCallbacks };
    disconnect();
    scheduleReconnect(true);
}

function scheduleReconnect(force) {
    if ((!autoReconnect && !force) || reconnectTimer) return;

    const { delayMs } = getReconnectConfig();
    log.reconnect(`Neuer Verbindungsversuch in ${formatSeconds(delayMs)} Sekunden.`);
    if (callbacks.onReconnecting) callbacks.onReconnecting();

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        try {
            connect();
        } catch (error) {
            log.error(`Verbindungsversuch fehlgeschlagen: ${error.message}`);
            scheduleReconnect(false);
        }
    }, delayMs);
}

function clearReconnectTimer() {
    if (!reconnectTimer) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
}

function getBot() {
    return bot;
}

function isConnected() {
    return bot !== null;
}

function setAutoReconnect(enabled) {
    autoReconnect = enabled;
    if (!enabled) clearReconnectTimer();
}

function isAutoReconnectEnabled() {
    return autoReconnect;
}

function formatSeconds(milliseconds) {
    return (milliseconds / 1000).toLocaleString("de-DE", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });
}

module.exports = {
    connect,
    disconnect,
    reconnect,
    getBot,
    isConnected,
    setAutoReconnect,
    isAutoReconnectEnabled
};

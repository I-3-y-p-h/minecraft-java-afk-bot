const { createMinecraftBot } = require("./client");
const { registerMinecraftEvents } = require("./events");

let bot = null;

let autoReconnect = true;
let manualDisconnect = false;

function connect(callbacks = {}) {

    if (bot) {
        console.log("Bot is already connected.");
        return bot;
    }

    console.log("Connecting...");

    manualDisconnect = false;

    bot = createMinecraftBot();

    registerMinecraftEvents(bot, callbacks);

    bot.on("end", () => {

        console.log("Disconnected!");

        bot = null;

        if (manualDisconnect) {
            console.log("Disconnect was manual. No reconnect.");
            return;
        }

        if (!autoReconnect) {
            console.log("Auto-Reconnect is disabled.");
            return;
        }

        console.log("Reconnecting in 5 seconds...");

        if (callbacks.onReconnecting) {
            callbacks.onReconnecting();
        }

        setTimeout(() => {
            connect(callbacks);
        }, Number(process.env.RECONNECT_DELAY) || 5000);
    });

    return bot;
}

function disconnect() {

    if (!bot) {
        console.log("Bot is already disconnected.");
        return;
    }

    console.log("Disconnecting...");

    manualDisconnect = true;

    bot.quit();
    bot = null;
}

function reconnect(callbacks = {}) {

    console.log("Reconnecting...");

    disconnect();

    setTimeout(() => {
        connect(callbacks);
    }, 2000);
}

function getBot() {
    return bot;
}

function isConnected() {
    return bot !== null;
}
function setAutoReconnect(enabled) {
    autoReconnect = enabled;
}

function isAutoReconnectEnabled() {
    return autoReconnect;
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
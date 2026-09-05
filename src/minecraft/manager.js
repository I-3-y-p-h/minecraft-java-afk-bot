const { createMinecraftBot } = require("./client");
const { registerMinecraftEvents } = require("./events");

let bot = null;

function connect() {
    if (bot) {
        console.log("Bot is already connected.");
        return bot;
    }

    console.log("Connecting...");

    bot = createMinecraftBot();

    registerMinecraftEvents(bot);

    bot.on("end", () => {
        console.log("Disconnected!");
        bot = null;
    });

    return bot;
}

function disconnect() {
    if (!bot) {
        console.log("Bot is already disconnected.");
        return;
    }

    console.log("Disconnecting...");

    bot.quit();
    bot = null;
}

function reconnect() {
    console.log("Reconnecting...");

    disconnect();

    setTimeout(() => {
        connect();
    }, 2000);
}

function getBot() {
    return bot;
}

function isConnected() {
    return bot !== null;
}

module.exports = {
    connect,
    disconnect,
    reconnect,
    getBot,
    isConnected
};
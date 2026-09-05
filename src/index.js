require("dotenv").config();

const {
    connect
} = require("./minecraft/manager");

const {
    startDiscordBot,
    sendKickMessage,
    sendReconnectingMessage
} = require("./discord/client");

const {
    setMinecraftStatus
} = require("./discord/status");

connect({
    onKicked: sendKickMessage,

    onReconnecting: () => {
        setMinecraftStatus("dnd", "Minecraft reconnecting...");
        sendReconnectingMessage();
    },

    onSpawn: () => {
        setMinecraftStatus("online", "Minecraft");
    }
});

startDiscordBot();
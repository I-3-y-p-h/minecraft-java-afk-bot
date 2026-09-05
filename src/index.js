require("dotenv").config();

const {
    connect
} = require("./minecraft/manager");

const {
    startDiscordBot,
    sendKickMessage,
    sendReconnectingMessage
} = require("./discord/client");

connect({
    onKicked: sendKickMessage,
    onReconnecting: sendReconnectingMessage
});

startDiscordBot();
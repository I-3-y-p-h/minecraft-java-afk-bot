require("dotenv").config();

const {
    connect
} = require("./minecraft/manager");

const {
    startDiscordBot,
    sendKickMessage
} = require("./discord/client");

connect({
    onKicked: sendKickMessage
});

startDiscordBot();
require("dotenv").config();

const { connect } = require("./minecraft/manager");
const { startDiscordBot } = require("./discord/client");

connect();
startDiscordBot();
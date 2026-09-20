const mineflayer = require("mineflayer");
const { getMinecraftConfig } = require("../config");

function createMinecraftBot(minecraft = getMinecraftConfig()) {
    const bot = mineflayer.createBot({
        host: minecraft.host,
        port: minecraft.port,
        username: minecraft.username,
        auth: minecraft.auth
    });

    return bot;
}

module.exports = {
    createMinecraftBot
};

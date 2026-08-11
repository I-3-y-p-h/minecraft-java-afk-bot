const mineflayer = require("mineflayer");

function createMinecraftBot() {

    console.log("HOST:", process.env.MC_HOST);
    console.log("PORT:", process.env.MC_PORT);
    console.log("USERNAME:", process.env.MC_USERNAME);

    const bot = mineflayer.createBot({
        host: process.env.MC_HOST,
        port: Number(process.env.MC_PORT),
        username: process.env.MC_USERNAME,
        auth: "microsoft",
        profilesFolder:"./auth"
    });

    return bot;
}

module.exports = {
    createMinecraftBot
};
require("dotenv").config();
const {
    createMinecraftBot
} = require("./minecraft/client");

const{
    registerMinecraftEvents
} = require("./minecraft/events");

async function main() {
    const minecraftBot = createMinecraftBot();
    registerMinecraftEvents(minecraftBot);
}

main();
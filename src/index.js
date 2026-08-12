require("dotenv").config();
const {
    createMinecraftBot
} = require("./minecraft/client");

const{
    registerMinecraftEvents
} = require("./minecraft/events");

async function connectMinecraftBot() {
    const minecraftBot = createMinecraftBot();
    registerMinecraftEvents(minecraftBot);

    minecraftBot.once("end", () =>{
        console.log(`Connection closed. \nReconnecting in ${Number(process.env.RECONNECT_DELAY)} ms...`);
        setTimeout(() =>{
            connectMinecraftBot();
        }, Number(process.env.RECONNECT_DELAY));
    });
}

connectMinecraftBot();
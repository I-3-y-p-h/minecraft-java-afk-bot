function registerMinecraftEvents(bot){
let initialized = false;
    bot.on("login", () =>
    {
        console.log("Login");
    });
    bot.on("spawn", async () =>{
        console.log("Bot spawned!");
        if(initialized){
            return;
        }
        await sleep(3000);
        bot.chat(`/switch ${process.env.CB}`);
        initialized = true;
        await sleep(10000);
        bot.chat("/p h");
    });
    bot.on("chat", (username,message) =>{
        console.log(`[${username} ${message}]`);
    });
    bot.on("kicked", (reason) => {
        console.log("Bot has been kicked:", reason);
    });

    bot.on("error", (error) => {
        console.error("Minecraft-Error:", error);
    });
}
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    registerMinecraftEvents
};
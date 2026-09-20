const { loadConfig } = require("../config");

function registerMinecraftEvents(bot, callbacks = {}, settings = loadConfig()) {
    let startupStarted = false;
    let disconnected = false;

    bot.on("end", () => {
        disconnected = true;
    });

    bot.on("login", () => {
        console.log("Login");
        if (callbacks.onLogin) callbacks.onLogin();
    });

    bot.on("spawn", () => {
        console.log("Bot spawned!");
        if (callbacks.onSpawn) callbacks.onSpawn();

        if (startupStarted) return;
        startupStarted = true;

        runStartup().catch(error => {
            console.error("Minecraft startup failed:", error.message);
        });
    });

    async function runStartup() {
        await sleep(settings.startupDelayMs);
        if (disconnected || !bot.player) return;

        const server = process.env.CB?.trim();
        if (!server) throw new Error("CB is not configured.");

        await switchAndWaitForSpawn(bot, server, settings.switchTimeoutMs);
        if (disconnected || !bot.player) return;

        const commands = settings.homeCommands;
        if (!Array.isArray(commands) || commands.length !== 3 ||
            commands.some(command => typeof command !== "string" || !command.startsWith("/") || /<[^>]+>/.test(command))) {
            throw new Error("Set three complete homeCommands in config.json before starting the bot.");
        }

        for (const [index, command] of commands.entries()) {
            if (disconnected || !bot.player) return;
            bot.chat(command);
            if (index < commands.length - 1) {
                await sleep(settings.homeCommandDelayMs);
            }
        }
    }

    bot.on("chat", (username, message) => {
        console.log(`[${username}] ${message}`);
    });

    bot.on("kicked", reason => {
        console.log("Bot has been kicked:", reason);
        if (callbacks.onKicked) callbacks.onKicked(reason);
    });

    bot.on("error", error => {
        console.error("Minecraft-Error:", error);
    });
}

function switchAndWaitForSpawn(bot, server, timeoutMs) {
    return new Promise((resolve, reject) => {
        let timer;
        const cleanup = () => {
            clearTimeout(timer);
            bot.removeListener("spawn", onSpawn);
            bot.removeListener("end", onEnd);
        };
        const onSpawn = () => {
            cleanup();
            resolve();
        };
        const onEnd = () => {
            cleanup();
            reject(new Error("Disconnected while switching servers."));
        };

        bot.once("spawn", onSpawn);
        bot.once("end", onEnd);
        timer = setTimeout(() => {
            cleanup();
            reject(new Error("No spawn event after /switch; home commands were not sent."));
        }, timeoutMs);

        try {
            bot.chat(`/switch ${server}`);
        } catch (error) {
            cleanup();
            reject(error);
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { registerMinecraftEvents };

const fs = require("node:fs");
const path = require("node:path");

const configPath = path.join(__dirname, "..", "config.json");

function loadConfig(filePath = configPath) {
    let contents;
    try {
        contents = fs.readFileSync(filePath, "utf8");
    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error("Missing config.json. Copy config.example.json to config.json and fill it in.");
        }
        throw error;
    }

    try {
        return JSON.parse(contents);
    } catch (error) {
        throw new Error("Invalid config.json. Check its JSON syntax.");
    }
}

function getDiscordConfig(settings = loadConfig()) {
    const discord = settings.discord;
    const fields = ["botToken", "clientId", "guildId", "kickedChannelId", "reconnectChannelId"];

    for (const field of fields) {
        const value = discord?.[field];
        if (typeof value !== "string" || !value.trim() || /<[^>]+>/.test(value)) {
            throw new Error(`Set discord.${field} in config.json.`);
        }
    }

    return discord;
}

module.exports = { loadConfig, getDiscordConfig };

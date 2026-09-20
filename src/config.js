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
    const missing = fields.filter(field => !isConfiguredString(discord?.[field]));
    if (missing.length) {
        throw new Error(`Set ${missing.map(field => `discord.${field}`).join(", ")} in config.json.`);
    }

    return discord;
}

function getMinecraftConfig(settings = loadConfig()) {
    const minecraft = settings.minecraft;
    const missing = ["host", "username", "targetServer"]
        .filter(field => !isConfiguredString(minecraft?.[field]));
    if (missing.length) {
        throw new Error(`Set ${missing.map(field => `minecraft.${field}`).join(", ")} in config.json.`);
    }

    if (!Number.isInteger(minecraft.port) || minecraft.port < 1 || minecraft.port > 65535) {
        throw new Error("Set minecraft.port to a valid port in config.json.");
    }
    if (!["microsoft", "offline"].includes(minecraft.auth)) {
        throw new Error("Set minecraft.auth to microsoft or offline in config.json.");
    }
    if (!Number.isInteger(minecraft.reconnectDelayMs) || minecraft.reconnectDelayMs < 0) {
        throw new Error("Set minecraft.reconnectDelayMs to a non-negative number in config.json.");
    }

    return minecraft;
}

function isConfiguredString(value) {
    return typeof value === "string" && Boolean(value.trim()) && !/<[^>]+>/.test(value);
}

function validateStartupConfig(settings = loadConfig()) {
    const problems = [];
    for (const validate of [getMinecraftConfig, getDiscordConfig]) {
        try {
            validate(settings);
        } catch (error) {
            problems.push(error.message);
        }
    }

    if (!Array.isArray(settings.homeCommands) || settings.homeCommands.length !== 3 ||
        settings.homeCommands.some(command => !isConfiguredString(command) || !command.startsWith("/"))) {
        problems.push("Set three complete homeCommands in config.json.");
    }
    for (const field of ["startupDelayMs", "switchTimeoutMs", "homeCommandDelayMs"]) {
        if (!Number.isInteger(settings[field]) || settings[field] < 0 ||
            (field === "switchTimeoutMs" && settings[field] === 0)) {
            problems.push(`Set ${field} to a valid number of milliseconds in config.json.`);
        }
    }

    if (problems.length) throw new Error(problems.join("\n"));
    return settings;
}

module.exports = { loadConfig, getDiscordConfig, getMinecraftConfig, validateStartupConfig };

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
    if (typeof discord?.enabled !== "boolean") {
        throw new Error("Set discord.enabled to true or false in config.json.");
    }
    if (!discord.enabled) return discord;

    const fields = ["botToken", "clientId", "guildId", "kickedChannelId", "reconnectChannelId"];
    const missing = fields.filter(field => !isConfiguredString(discord?.[field]));
    if (missing.length) {
        throw new Error(`Set ${missing.map(field => `discord.${field}`).join(", ")} in config.json.`);
    }

    return discord;
}

function getMinecraftConfig(settings = loadConfig()) {
    const minecraft = settings.bot;
    const missing = ["host", "username", "auth", "version", "profilesFolder"]
        .filter(field => !isConfiguredString(minecraft?.[field]));
    if (missing.length) {
        throw new Error(`Set ${missing.map(field => `bot.${field}`).join(", ")} in config.json.`);
    }

    if (!Number.isInteger(minecraft.port) || minecraft.port < 1 || minecraft.port > 65535) {
        throw new Error("Set bot.port to a valid port in config.json.");
    }
    if (minecraft.auth !== "microsoft") {
        throw new Error("Set bot.auth to microsoft in config.json.");
    }

    return minecraft;
}

function getStartupConfig(settings = loadConfig()) {
    return settings.startup;
}

function getReconnectConfig(settings = loadConfig()) {
    return settings.reconnect;
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

    const startup = settings.startup;
    if (!isCommandList(startup?.switchCommands, command => command.startsWith("/switch "))) {
        problems.push("Set at least one complete startup.switchCommands entry beginning with /switch in config.json.");
    }
    if (!isCommandList(startup?.homeCommands) || startup.homeCommands.length !== 3) {
        problems.push("Set exactly three complete startup.homeCommands in config.json.");
    }
    if (!isConfiguredString(startup?.dataLoadedMessage)) {
        problems.push("Set startup.dataLoadedMessage in config.json.");
    }
    for (const field of ["switchAfterJoinMs", "switchCommandDelayMs", "homeAfterDataLoadedMs", "homeCommandDelayMs"]) {
        if (!Number.isInteger(startup?.[field]) || startup[field] < 0) {
            problems.push(`Set startup.${field} to a non-negative number of milliseconds in config.json.`);
        }
    }

    const reconnect = settings.reconnect;
    if (typeof reconnect?.enabled !== "boolean") {
        problems.push("Set reconnect.enabled to true or false in config.json.");
    }
    if (!Number.isInteger(reconnect?.delayMs) || reconnect.delayMs < 0) {
        problems.push("Set reconnect.delayMs to a non-negative number of milliseconds in config.json.");
    }

    if (problems.length) throw new Error(problems.join("\n"));
    return settings;
}

function isCommandList(commands, predicate = () => true) {
    return Array.isArray(commands) && commands.length > 0 && commands.every(command =>
        isConfiguredString(command) && command.startsWith("/") && predicate(command)
    );
}

module.exports = {
    loadConfig,
    getDiscordConfig,
    getMinecraftConfig,
    getStartupConfig,
    getReconnectConfig,
    validateStartupConfig
};

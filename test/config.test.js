const test = require("node:test");
const assert = require("node:assert/strict");
const {
    getDiscordConfig,
    getMinecraftConfig,
    loadConfig,
    validateStartupConfig
} = require("../src/config");

const configured = {
    bot: {
        host: "play.example.com",
        port: 25565,
        username: "player@example.com",
        auth: "microsoft",
        version: "1.8.9",
        profilesFolder: "./profiles"
    },
    startup: {
        switchAfterJoinMs: 0,
        switchCommandDelayMs: 0,
        switchCommands: ["/switch cb21"],
        dataLoadedMessage: "data ready",
        homeAfterDataLoadedMs: 0,
        homeCommandDelayMs: 0,
        homeCommands: ["/home one", "/home two", "/home three"]
    },
    reconnect: {
        enabled: true,
        delayMs: 5000
    },
    discord: {
        enabled: true,
        botToken: "test-token",
        clientId: "123",
        guildId: "456",
        kickedChannelId: "789",
        reconnectChannelId: "012"
    }
};

test("accepts Minecraft settings and a complete startup config", () => {
    assert.deepEqual(getMinecraftConfig(configured), configured.bot);
    assert.equal(validateStartupConfig(configured), configured);
});

test("reports a missing Minecraft account", () => {
    assert.throws(
        () => getMinecraftConfig({ bot: { ...configured.bot, username: "<microsoft-account-email>" } }),
        /bot\.username/
    );
});

test("reports all placeholder groups before connecting", () => {
    assert.throws(
        () => validateStartupConfig(loadConfig()),
        error => /bot\.username/.test(error.message) &&
            /discord\.botToken/.test(error.message) &&
            /switchCommands/.test(error.message) &&
            /homeCommands/.test(error.message)
    );
});

test("allows Discord to be disabled without credentials", () => {
    const settings = {
        ...configured,
        discord: { enabled: false }
    };
    assert.deepEqual(getDiscordConfig(settings), settings.discord);
    assert.equal(validateStartupConfig(settings), settings);
});

test("accepts the Discord settings from config", () => {
    assert.deepEqual(getDiscordConfig(configured), configured.discord);
});

test("rejects placeholder Discord settings", () => {
    assert.throws(
        () => getDiscordConfig({
            discord: { ...configured.discord, botToken: "<discord-bot-token>" }
        }),
        /discord\.botToken/
    );
});

test("explains how to create a missing config.json", () => {
    assert.throws(
        () => loadConfig("missing-config-for-test.json"),
        /Copy config\.example\.json to config\.json/
    );
});

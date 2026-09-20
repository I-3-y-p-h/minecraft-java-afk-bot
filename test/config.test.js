const test = require("node:test");
const assert = require("node:assert/strict");
const {
    getDiscordConfig,
    getMinecraftConfig,
    loadConfig,
    validateStartupConfig
} = require("../src/config");

const configured = {
    minecraft: {
        host: "play.example.com",
        port: 25565,
        username: "player@example.com",
        auth: "microsoft",
        targetServer: "afk",
        reconnectDelayMs: 5000
    },
    startupDelayMs: 0,
    switchTimeoutMs: 1000,
    homeCommandDelayMs: 0,
    homeCommands: ["/home one", "/home two", "/home three"],
    discord: {
        botToken: "test-token",
        clientId: "123",
        guildId: "456",
        kickedChannelId: "789",
        reconnectChannelId: "012"
    }
};

test("accepts Minecraft settings and a complete startup config", () => {
    assert.deepEqual(getMinecraftConfig(configured), configured.minecraft);
    assert.equal(validateStartupConfig(configured), configured);
});

test("reports missing Minecraft account and switch server", () => {
    assert.throws(
        () => getMinecraftConfig({ minecraft: { ...configured.minecraft, username: "<microsoft-account-email>", targetServer: "<server-after-switch>" } }),
        /minecraft\.username, minecraft\.targetServer/
    );
});

test("reports all placeholder groups before connecting", () => {
    assert.throws(
        () => validateStartupConfig(loadConfig()),
        error => /minecraft\.host/.test(error.message) &&
            /discord\.botToken/.test(error.message) &&
            /homeCommands/.test(error.message)
    );
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

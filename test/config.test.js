const test = require("node:test");
const assert = require("node:assert/strict");
const { getDiscordConfig, loadConfig } = require("../src/config");

const configured = {
    discord: {
        botToken: "test-token",
        clientId: "123",
        guildId: "456",
        kickedChannelId: "789",
        reconnectChannelId: "012"
    }
};

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

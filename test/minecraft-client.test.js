const test = require("node:test");
const assert = require("node:assert/strict");
const mineflayer = require("mineflayer");
const { createMinecraftBot } = require("../src/minecraft/client");

test("passes the configured account and server to Mineflayer", () => {
    const originalCreateBot = mineflayer.createBot;
    let options;
    mineflayer.createBot = passedOptions => {
        options = passedOptions;
        return { connected: true };
    };

    try {
        assert.deepEqual(createMinecraftBot({
            host: "play.example.com",
            port: 25565,
            username: "player@example.com",
            auth: "microsoft",
            version: "1.8.9",
            profilesFolder: "./profiles"
        }), { connected: true });
        assert.deepEqual(options, {
            host: "play.example.com",
            port: 25565,
            username: "player@example.com",
            auth: "microsoft",
            version: "1.8.9",
            profilesFolder: "./profiles"
        });
    } finally {
        mineflayer.createBot = originalCreateBot;
    }
});

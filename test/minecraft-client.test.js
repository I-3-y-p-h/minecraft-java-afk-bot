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
            auth: "microsoft"
        }), { connected: true });
        assert.deepEqual(options, {
            host: "play.example.com",
            port: 25565,
            username: "player@example.com",
            auth: "microsoft"
        });
    } finally {
        mineflayer.createBot = originalCreateBot;
    }
});

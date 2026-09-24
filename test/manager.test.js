const test = require("node:test");
const assert = require("node:assert/strict");
const EventEmitter = require("node:events");

test("uses only one automatic reconnect timer", async () => {
    const clientModule = require("../src/minecraft/client");
    const configModule = require("../src/config");
    const originalCreateBot = clientModule.createMinecraftBot;
    const originalGetMinecraftConfig = configModule.getMinecraftConfig;
    const originalGetReconnectConfig = configModule.getReconnectConfig;
    let createCount = 0;

    clientModule.createMinecraftBot = () => {
        createCount += 1;
        const bot = new EventEmitter();
        bot.username = "TestBot";
        bot.chat = () => {};
        bot.quit = () => bot.emit("end", "manual");
        return bot;
    };
    configModule.getMinecraftConfig = () => ({ host: "example.com", port: 25565 });
    configModule.getReconnectConfig = () => ({ enabled: true, delayMs: 5 });

    const managerPath = require.resolve("../src/minecraft/manager");
    delete require.cache[managerPath];
    const manager = require(managerPath);

    try {
        const firstBot = manager.connect();
        firstBot.emit("end", "connection lost");
        firstBot.emit("end", "duplicate event");
        await new Promise(resolve => setTimeout(resolve, 20));
        assert.equal(createCount, 2);
        manager.disconnect();
    } finally {
        clientModule.createMinecraftBot = originalCreateBot;
        configModule.getMinecraftConfig = originalGetMinecraftConfig;
        configModule.getReconnectConfig = originalGetReconnectConfig;
        delete require.cache[managerPath];
    }
});

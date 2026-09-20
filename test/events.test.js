const test = require("node:test");
const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { registerMinecraftEvents } = require("../src/minecraft/events");

function createBot() {
    const bot = new EventEmitter();
    const sent = [];
    bot.player = {};
    bot.chat = command => sent.push(command);
    return { bot, sent };
}

async function waitFor(predicate, timeoutMs = 200) {
    const deadline = Date.now() + timeoutMs;
    while (!predicate() && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    assert.ok(predicate(), "Timed out waiting for bot commands");
}

const settings = {
    minecraft: { targetServer: "test-server" },
    startupDelayMs: 0,
    switchTimeoutMs: 500,
    homeCommandDelayMs: 0,
    homeCommands: ["/home first", "/home second", "/home third"]
};

test("sends all three home commands only after the switch spawn", async () => {
    const { bot, sent } = createBot();
    registerMinecraftEvents(bot, {}, settings);

    bot.emit("spawn");
    await waitFor(() => sent.length === 1);
    assert.deepEqual(sent, ["/switch test-server"]);

    bot.emit("spawn");
    await waitFor(() => sent.length === 4);
    assert.deepEqual(sent, [
        "/switch test-server",
        "/home first",
        "/home second",
        "/home third"
    ]);

    bot.emit("spawn");
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(sent.length, 4);
});

test("does not send home commands when the switch never completes", async () => {
    const { bot, sent } = createBot();
    registerMinecraftEvents(bot, {}, { ...settings, switchTimeoutMs: 10 });

    bot.emit("spawn");
    await waitFor(() => sent.length === 1);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.deepEqual(sent, ["/switch test-server"]);
});


test("refuses to send placeholder commands", async () => {
    const { bot, sent } = createBot();
    registerMinecraftEvents(bot, {}, {
        ...settings,
        homeCommands: ["/home <name>", "/home <name>", "/home <name>"]
    });

    bot.emit("spawn");
    await waitFor(() => sent.length === 1);
    bot.emit("spawn");
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.deepEqual(sent, ["/switch test-server"]);
});

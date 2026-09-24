const test = require("node:test");
const assert = require("node:assert/strict");
const EventEmitter = require("node:events");
const { registerMinecraftEvents, toPlainText } = require("../src/minecraft/events");

function createBot() {
    const bot = new EventEmitter();
    const sent = [];
    bot.username = "TestBot";
    bot.chat = command => sent.push(command);
    return { bot, sent };
}

async function waitFor(predicate, timeoutMs = 250) {
    const deadline = Date.now() + timeoutMs;
    while (!predicate() && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    assert.ok(predicate(), "Timed out waiting for bot commands");
}

const settings = {
    startup: {
        switchAfterJoinMs: 0,
        switchCommandDelayMs: 0,
        switchCommands: ["/switch cb21", "/switch portal"],
        dataLoadedMessage: "[GrieferGames] Deine Daten wurden vollständig heruntergeladen.",
        homeAfterDataLoadedMs: 0,
        homeCommandDelayMs: 0,
        homeCommands: ["/home first", "/home second", "/home third"]
    }
};

test("sends configured switch commands once after the initial spawn", async () => {
    const { bot, sent } = createBot();
    registerMinecraftEvents(bot, {}, settings);

    bot.emit("spawn");
    await waitFor(() => sent.length === 2);
    bot.emit("spawn");
    await new Promise(resolve => setTimeout(resolve, 10));

    assert.deepEqual(sent, ["/switch cb21", "/switch portal"]);
});

test("sends all three home commands only after the complete data message", async () => {
    const { bot, sent } = createBot();
    registerMinecraftEvents(bot, {}, settings);

    bot.emit("spawn");
    await waitFor(() => sent.length === 2);
    bot.emit("messagestr", "§aNoch nicht vollständig");
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(sent.length, 2);

    bot.emit("messagestr", "§6[GrieferGames] Deine Daten wurden vollständig heruntergeladen.");
    await waitFor(() => sent.length === 5);
    assert.deepEqual(sent.slice(2), ["/home first", "/home second", "/home third"]);

    bot.emit("messagestr", settings.startup.dataLoadedMessage);
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(sent.length, 5);
});

test("does not send homes when disconnected during the data buffer", async () => {
    const { bot, sent } = createBot();
    const delayed = {
        startup: { ...settings.startup, homeAfterDataLoadedMs: 20 }
    };
    registerMinecraftEvents(bot, {}, delayed);

    bot.emit("spawn");
    await waitFor(() => sent.length === 2);
    bot.emit("messagestr", settings.startup.dataLoadedMessage);
    bot.emit("end");
    await new Promise(resolve => setTimeout(resolve, 30));

    assert.equal(sent.length, 2);
});

test("removes Minecraft formatting codes", () => {
    assert.equal(toPlainText("§6Hallo §aWelt"), "Hallo Welt");
});

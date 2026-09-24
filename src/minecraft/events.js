const { loadConfig } = require("../config");
const { log } = require("../logger");

function registerMinecraftEvents(bot, callbacks = {}, settings = loadConfig()) {
    const startup = settings.startup;
    let disconnected = false;
    let spawnHandled = false;
    let switchCommandsSent = false;
    let homeSequenceStarted = false;

    bot.on("end", reason => {
        disconnected = true;
        const detail = toPlainText(reason);
        log.error(detail ? `Minecraft-Verbindung getrennt: ${detail}` : "Minecraft-Verbindung getrennt.");
    });

    bot.on("login", () => {
        log.success(`Bot ist als ${bot.username || "Minecraft-Spieler"} verbunden.`);
        if (callbacks.onLogin) callbacks.onLogin();
    });

    bot.on("spawn", () => {
        if (callbacks.onSpawn) callbacks.onSpawn();
        if (spawnHandled) return;
        spawnHandled = true;

        sendSwitchCommands().catch(error => {
            log.error(`Startablauf fehlgeschlagen: ${error.message}`);
        });
    });

    bot.on("messagestr", message => {
        const plainMessage = toPlainText(message);
        if (!plainMessage || !switchCommandsSent || homeSequenceStarted) return;
        if (!plainMessage.includes(startup.dataLoadedMessage)) return;

        homeSequenceStarted = true;
        sendHomeCommands().catch(error => {
            log.error(`Home-Ablauf fehlgeschlagen: ${error.message}`);
        });
    });

    bot.on("kicked", reason => {
        const detail = toPlainText(reason) || "Unbekannter Grund";
        log.error(`Bot wurde gekickt: ${detail}`);
        if (callbacks.onKicked) callbacks.onKicked(reason);
    });

    bot.on("error", error => {
        log.error(`Minecraft-Fehler: ${error.message}`);
    });

    async function sendSwitchCommands() {
        log.wait(`Warte ${formatSeconds(startup.switchAfterJoinMs)} Sekunden vor dem Serverwechsel.`);
        await sleep(startup.switchAfterJoinMs);
        if (disconnected) return;

        for (const [index, command] of startup.switchCommands.entries()) {
            if (disconnected) return;
            bot.chat(command);
            log.command(`${command} wurde gesendet.`);
            if (index < startup.switchCommands.length - 1) {
                await sleep(startup.switchCommandDelayMs);
            }
        }
        switchCommandsSent = true;
        log.wait("Warte auf die vollständige Datenmeldung von GrieferGames.");
    }

    async function sendHomeCommands() {
        log.success("Die Spielerdaten wurden vollständig heruntergeladen.");
        log.wait(`Warte ${formatSeconds(startup.homeAfterDataLoadedMs)} Sekunden vor dem Home-Teleport.`);
        await sleep(startup.homeAfterDataLoadedMs);
        if (disconnected) return;

        for (const [index, command] of startup.homeCommands.entries()) {
            if (disconnected) return;
            bot.chat(command);
            log.command(`${command} wurde gesendet.`);
            if (index < startup.homeCommands.length - 1) {
                await sleep(startup.homeCommandDelayMs);
            }
        }
        log.success("Startablauf vollständig abgeschlossen.");
        if (callbacks.onStartupComplete) callbacks.onStartupComplete();
    }
}

function toPlainText(value) {
    if (value === undefined || value === null) return "";
    let text;
    if (typeof value === "string") text = value;
    else if (typeof value.toString === "function") text = value.toString();
    else text = JSON.stringify(value);
    return text.replace(/§[0-9A-FK-OR]/gi, "").trim();
}

function formatSeconds(milliseconds) {
    return (milliseconds / 1000).toLocaleString("de-DE", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { registerMinecraftEvents, toPlainText };

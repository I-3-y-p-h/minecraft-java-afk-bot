const { validateStartupConfig } = require("./config");
const { log } = require("./logger");

async function main() {
    const settings = validateStartupConfig();
    log.info("Mineflayer-Bot wird gestartet.");

    const { connect } = require("./minecraft/manager");
    let callbacks = {};

    if (settings.discord.enabled) {
        const {
            startDiscordBot,
            sendKickMessage,
            sendReconnectingMessage
        } = require("./discord/client");
        const { setMinecraftStatus } = require("./discord/status");

        callbacks = {
            onKicked: sendKickMessage,
            onReconnecting: () => {
                setMinecraftStatus("dnd", "Minecraft reconnecting...");
                sendReconnectingMessage();
            },
            onSpawn: () => {
                setMinecraftStatus("online", "Minecraft");
            }
        };

        startDiscordBot().catch(error => {
            log.error(`Discord-Bot konnte nicht gestartet werden: ${error.message}`);
        });
    } else {
        log.info("Discord-Bot ist in config.json deaktiviert.");
    }

    connect(callbacks);
}

main().catch(error => {
    log.error(`Start fehlgeschlagen: ${error.message}`);
    process.exit(1);
});

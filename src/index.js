const { validateStartupConfig } = require("./config");

async function main() {
    validateStartupConfig();

    const { connect } = require("./minecraft/manager");
    const {
        startDiscordBot,
        sendKickMessage,
        sendReconnectingMessage
    } = require("./discord/client");
    const { setMinecraftStatus } = require("./discord/status");

    await startDiscordBot();

    connect({
        onKicked: sendKickMessage,
        onReconnecting: () => {
            setMinecraftStatus("dnd", "Minecraft reconnecting...");
            sendReconnectingMessage();
        },
        onSpawn: () => {
            setMinecraftStatus("online", "Minecraft");
        }
    });
}

main().catch(error => {
    console.error("Startup failed:", error.message);
    process.exit(1);
});

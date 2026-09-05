let discordClient = null;

function setDiscordClient(client) {
    discordClient = client;
}

function setMinecraftStatus(status, text) {

    if (!discordClient || !discordClient.isReady()) {
        console.log("Discord client is not ready.");
        return;
    }

    console.log(`Setting Discord status: ${status} - ${text}`);

    discordClient.user.setPresence({
        status: status,
        activities: [
            {
                name: text,
                type: 0
            }
        ]
    });
}

module.exports = {
    setDiscordClient,
    setMinecraftStatus
};
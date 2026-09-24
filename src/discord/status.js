let discordClient = null;
const { log } = require("../logger");

function setDiscordClient(client) {
    discordClient = client;
}

function setMinecraftStatus(status, text) {

    if (!discordClient || !discordClient.isReady()) {
        log.wait("Der Discord-Bot ist noch nicht bereit für eine Statusänderung.");
        return;
    }

    log.info(`Discord-Status: ${status} – ${text}`);

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

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");
const { setDiscordClient } = require("./status");
const { getDiscordConfig } = require("../config");
const { log } = require("../logger");
const discordConfig = getDiscordConfig();
const say = require("./commands/say");
const stop = require("./commands/stop");
const reconnect = require("./commands/reconnect");
const autoreconnect = require("./commands/autoreconnect");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

client.commands.set(say.data.name, say);
client.commands.set(stop.data.name, stop);
client.commands.set(reconnect.data.name, reconnect);
client.commands.set(autoreconnect.data.name, autoreconnect);

function startDiscordBot() {

    client.once("ready", () => {
        setDiscordClient(client);
        log.success(`Discord-Bot ist als ${client.user.tag} verbunden.`);

        client.user.setPresence({
            status: "online",
            activities: [
                {
                    name: "Minecraft",
                    type: 0
                }
            ]
        });
    });

    client.on("interactionCreate", async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            log.error(`Discord-Befehl fehlgeschlagen: ${error.message}`);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(
                    "Error while executing command."
                );
            } else {
                await interaction.reply(
                    "Error while executing command."
                );
            }
        }
    });

    return client.login(discordConfig.botToken);
}
async function sendKickMessage(reason) {

    try {

        const channel = await client.channels.fetch(
            discordConfig.kickedChannelId
        );

        if (!channel) {
            log.error("Der Discord-Kick-Kanal wurde nicht gefunden.");
            return;
        }

        let message = "Unknown reason";

        if (
            reason &&
            reason.value &&
            reason.value.text &&
            reason.value.text.value
        ) {
            message = reason.value.text.value;
        }

        await channel.send(
            `Bot has been kicked:\n${message}`
        );

    } catch (error) {
        log.error(`Kick-Nachricht konnte nicht gesendet werden: ${error.message}`);
    }
}


async function sendReconnectingMessage() {

    try {

        const channel = await client.channels.fetch(
            discordConfig.reconnectChannelId
        );

        if (!channel) {
            log.error("Der Discord-Reconnect-Kanal wurde nicht gefunden.");
            return;
        }

        await channel.send(
            `Minecraft-Bot is reconnecting...`
        );

    } catch (error) {
        log.error(`Reconnect-Nachricht konnte nicht gesendet werden: ${error.message}`);
    }
}


module.exports = {
    client,
    startDiscordBot,
    sendKickMessage,
    sendReconnectingMessage
};

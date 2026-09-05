const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");
const { setDiscordClient } = require("./status");
const say = require("./commands/say");
const stop = require("./commands/stop");
const reconnect = require("./commands/reconnect");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

client.commands.set(say.data.name, say);
client.commands.set(stop.data.name, stop);
client.commands.set(reconnect.data.name, reconnect);

function startDiscordBot() {

    client.once("ready", () => {
        console.log(`Discord-Bot logged in as ${client.user.tag}`);

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
            console.error(error);

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

    client.login(process.env.DISCORD_TOKEN);
}
async function sendKickMessage(reason) {

    try {

        const channel = await client.channels.fetch(
            process.env.DISCORD_CHANNEL_ID_KICKED
        );

        if (!channel) {
            console.error("Kick channel not found.");
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
        console.error("Could not send kick message:", error);
    }
}


async function sendReconnectingMessage() {

    try {

        const channel = await client.channels.fetch(
            process.env.DISCORD_CHANNEL_ID_RECONNECT
        );

        if (!channel) {
            console.error("Reconnect channel not found.");
            return;
        }

        await channel.send(
            `Minecraft-Bot is reconnecting...`
        );

    } catch (error) {
        console.error("Could not send reconnect message:", error);
    }
}


module.exports = {
    client,
    startDiscordBot,
    sendKickMessage,
    sendReconnectingMessage
};
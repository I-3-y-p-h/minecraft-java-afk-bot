const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

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

        await channel.send(
            `Bot has been kicked: ${reason}`
        );

    } catch (error) {
        console.error("Could not send kick message:", error);
    }
}

module.exports = {
    client,
    startDiscordBot,
    sendKickMessage
};
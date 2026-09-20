const { getDiscordConfig } = require("./config");
const discordConfig = getDiscordConfig();

const { REST, Routes } = require("discord.js");

const say = require("./discord/commands/say");
const stop = require("./discord/commands/stop");
const reconnect = require("./discord/commands/reconnect");
const autoreconnect = require("./discord/commands/autoreconnect");

const commands = [
    say.data.toJSON(),
    stop.data.toJSON(),
    reconnect.data.toJSON(),
    autoreconnect.data.toJSON()
];

const rest = new REST({ version: "10" }).setToken(
    discordConfig.botToken
);

const CLIENT_ID = discordConfig.clientId;
const GUILD_ID = discordConfig.guildId;

async function deployCommands() {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            {
                body: commands
            }
        );

        console.log("Slash commands registered!");
    } catch (error) {
        console.error(error);
    }
}

deployCommands();
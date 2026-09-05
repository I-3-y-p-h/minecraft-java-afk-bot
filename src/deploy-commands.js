require("dotenv").config();

const { REST, Routes } = require("discord.js");

const say = require("./discord/commands/say");
const stop = require("./discord/commands/stop");
const reconnect = require("./discord/commands/reconnect");

const commands = [
    say.data.toJSON(),
    stop.data.toJSON(),
    reconnect.data.toJSON()
];

const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN
);

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

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
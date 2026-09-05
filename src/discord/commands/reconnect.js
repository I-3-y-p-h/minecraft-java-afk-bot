const { SlashCommandBuilder } = require("discord.js");
const { reconnect } = require("../../minecraft/manager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reconnect")
        .setDescription("Reconnect your bot."),

    async execute(interaction) {

        reconnect();

        await interaction.reply("Bot is reconnecting...");
    }
};
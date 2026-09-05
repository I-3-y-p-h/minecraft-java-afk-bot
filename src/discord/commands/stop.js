const { SlashCommandBuilder } = require("discord.js");
const { disconnect } = require("../../minecraft/manager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Take your bot offline."),

    async execute(interaction) {

        disconnect();

        await interaction.reply("Bot has been stopped.");
    }
};
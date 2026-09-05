const { SlashCommandBuilder } = require("discord.js");
const { disconnect } = require("../../minecraft/manager");
const { setMinecraftStatus } = require("../status");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Take your bot offline."),

    async execute(interaction) {

        disconnect();

        setMinecraftStatus("idle", "Minecraft offline");

        await interaction.reply(
            "Bot is now offline."
        );
    }
};
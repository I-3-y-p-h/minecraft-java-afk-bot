const { SlashCommandBuilder } = require("discord.js");
const { reconnect } = require("../../minecraft/manager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reconnect")
        .setDescription("Reconnect your bot."),

    async execute(interaction) {

        const message = await interaction.reply({
            content: "Bot is reconnecting...",
            fetchReply: true
        });

        reconnect({
            onSpawn: async () => {
                await message.edit("Bot has reconnected!");
            }
        });
    }
};
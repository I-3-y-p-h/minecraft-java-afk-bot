const { SlashCommandBuilder } = require("discord.js");
const { getBot } = require("../../minecraft/manager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Write a message in the mc chat.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Your message")
                .setRequired(true)
        ),

    async execute(interaction) {

        const bot = getBot();

        if (!bot) {
            return interaction.reply("Bot is currently offline.");
        }

        const message = interaction.options.getString("message");

        bot.chat(message);

        await interaction.reply(`Message sent: \`${message}\``);
    }
};
const { SlashCommandBuilder } = require("discord.js");

const {
    setAutoReconnect,
    isAutoReconnectEnabled
} = require("../../minecraft/manager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autoreconnect")
        .setDescription("Enable or disable automatic Minecraft reconnects.")
        .addBooleanOption(option =>
            option
                .setName("enabled")
                .setDescription("Enable or disable Auto-Reconnect.")
                .setRequired(true)
        ),

    async execute(interaction) {

        const enabled = interaction.options.getBoolean("enabled");

        setAutoReconnect(enabled);

        await interaction.reply(
            enabled
                ? "🟢 Auto-Reconnect is now enabled."
                : "🔴 Auto-Reconnect is now disabled."
        );
    }
};
# Minecraft Java AFK bot

Copy `config.example.json` to `config.json`. Fill in the three `homeCommands` and these Discord settings:

- `discord.botToken`: Discord bot token
- `discord.clientId`: Discord application ID
- `discord.guildId`: Discord server ID for slash commands
- `discord.kickedChannelId`: channel for kick notices
- `discord.reconnectChannelId`: channel for reconnect notices

`config.json` is ignored by Git because it contains the bot token. Keep the real token out of commits and shared logs. The Minecraft connection still uses the existing `.env` variables (`MC_HOST`, `MC_PORT`, `MC_USERNAME`, `CB`, and optionally `RECONNECT_DELAY`).

Run `node src/deploy-commands.js` to register slash commands, then `node src/index.js` to start the bot.

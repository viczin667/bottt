const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { Painel } = require("../../Functions/Painel");
const { Emojis } = require("../../DataBaseJson");
const { owner } = require('../../config.json');

module.exports = {
  name: "panel",
  description: "Use to manage my features",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    const ownerIdList = owner;
    
    if (!ownerIdList.includes(interaction.user.id)) {
      return await interaction.reply({
        content: `${Emojis.get(`negative_emoji`)} Você não possui permissão para usar este comando.`,
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    Painel(interaction, client);
  }
}

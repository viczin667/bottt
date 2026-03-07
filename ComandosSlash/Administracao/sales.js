const { PermissionFlagsBits, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { Emojis } = require("../../DataBaseJson");


module.exports = {
  name: "sales",
  description: "Use para ver suas vendas esse mês",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction, message) => {

            if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({  content: `${Emojis.get(`negative_emoji`)} Faltam permissões.`, ephemeral: true });
        }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("todayyyy")
          .setLabel('Hoje')
          .setStyle(2)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId("7daysss")
          .setLabel('Últimos 7 dias')
          .setStyle(2)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId("30dayss")
          .setLabel('Últimos 30 dias')
          .setStyle(2)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId("totalrendimento")
          .setLabel('Rendimento Total')
          .setStyle(3)
          .setDisabled(false),
      )

    interaction.reply({ content: `Olá senhor **${interaction.user.username}**, selecione algum filtro.`, components: [row]})
  }
}

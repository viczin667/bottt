const { PermissionFlagsBits, EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { configuracao } = require("../../DataBaseJson");
const { EstatisticasStorm } = require("../../index.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
  name: "vincular_clientes",
  description: "Vincular clientes ao seu servidor",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction, message) => {

            if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({  content: `${Emojis.get(`negative_emoji`)} Faltam permissões.`, ephemeral: true });
        }

    const aa = configuracao.get(`ConfigRoles.cargoCliente`)

    const clientes = await EstatisticasStorm.GuildClients()
    let clientesSetadosComSucesso = 0;
    await interaction.reply({ content: `Processo de sincronização de clientes foi iniciado.\nNesse momento, estou analisando \`${clientes.length}\` usuários e restaurando seus cargos.`, ephemeral: true })


    await Promise.all(clientes.map(async iterator => {
      try {
        const member = await interaction.guild.members.fetch(iterator);
        if (member) {
          await member.roles.add(aa);
          clientesSetadosComSucesso++;
        }
      } catch (error) {
        console.error(error)
      }
    }));

    interaction.editReply({ ephemeral: true, content: `${Emojis.get(`confirmed_emoji`)} Processo de sincronização de clientes concluído. ${clientesSetadosComSucesso} usuários foram sincronizados com sucesso.` });

  }
}

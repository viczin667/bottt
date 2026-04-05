const { PermissionFlagsBits, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { Painel } = require("../../Functions/Painel");
const { Emojis, configuracao } = require("../../DataBaseJson");
const { owner } = require('../../config.json');

module.exports = {
  name: "panel",
  description: "📦 [ADMIN] Envia o painel de vendas/atendimento.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "id_venda",
      description: "ID do produto configurado no setconfig (Ex: roblox, ff, host)",
      type: ApplicationCommandOptionType.String,
      required: true // Agora é obrigatório para o bot saber o que exibir
    }
  ],

  run: async (client, interaction) => {
    if (!owner.includes(interaction.user.id)) {
      return await interaction.reply({
        content: `${Emojis.get(`negative_emoji`)} Você não possui permissão para usar este comando.`,
        ephemeral: true
      });
    }

    const idVenda = interaction.options.getString("id_venda");

    // Verifica se esse ID foi configurado no setconfig antes de enviar
    const checkConfig = configuracao.get(`VendasAtivas.${interaction.channelId}`);
    
    if (!checkConfig || checkConfig.id !== idVenda) {
        return interaction.reply({
            content: `⚠️ Este canal não está configurado para o ID: **${idVenda}**. Use \`/setconfig\` primeiro.`,
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    // Passamos o idVenda para a função Painel para ela saber qual Embed/Botão gerar
    Painel(interaction, client, idVenda);
    
    await interaction.editReply({ content: "✅ Painel enviado com sucesso!" });
  }
}

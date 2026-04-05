const { PermissionFlagsBits, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { Painel } = require("../../Functions/Painel");
const { Emojis } = require("../../DataBaseJson");
const { owner } = require('../../config.json');

module.exports = {
  name: "panel",
  description: "📦 [ADMIN] Envia o painel de vendas/atendimento.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "id_venda",
      description: "ID do produto (Ex: roblox, ff, host)",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  run: async (client, interaction) => {
    // 1. Responda imediatamente com deferReply (ephemeral: true para não poluir o chat)
    await interaction.deferReply({ ephemeral: true });

    if (!owner.includes(interaction.user.id)) {
      return await interaction.editReply({
        content: `${Emojis.get(`negative_emoji`)} Você não possui permissão.`
      });
    }

    const idVenda = interaction.options.getString("id_venda");

    try {
        // 2. Chama a função que envia o painel no canal
        await Painel(interaction, client, idVenda);
        
        // 3. Edita a resposta inicial confirmando o envio
        await interaction.editReply({ content: "✅ Painel enviado com sucesso!" });

    } catch (error) {
        console.error("Erro ao enviar painel:", error);
        await interaction.editReply({ content: "❌ Ocorreu um erro ao gerar o painel. Verifique o console." });
    }
  }
}

const { PermissionFlagsBits, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { Painel } = require("../../Functions/Painel");
const { Emojis, perms, produtos } = require("../../DataBaseJson");
const { owner } = require('../../config.json');

module.exports = {
  name: "panel",
  description: "📦 [Xenza] Enviar vitrine de vendas para o canal.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "id_venda",
      description: "ID do produto cadastrado (Ex: netflix, nitro, roblox)",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true // Recomendo ativar para facilitar sua vida
    }
  ],

  run: async (client, interaction) => {
    // 1. Resposta imediata para o Discord não cancelar o comando (Crucial para o Render)
    await interaction.deferReply({ ephemeral: true });

    // Sistema de Permissão Híbrida (Owner do config ou Staff da DB)
    const isOwner = owner.includes(interaction.user.id);
    const isStaff = await perms.get(interaction.user.id);

    if (!isOwner && !isStaff) {
      return await interaction.editReply({
        content: `${Emojis.get(`negative_emoji`) || "❌"} Você não possui autoridade para gerenciar painéis.`
      });
    }

    const idVenda = interaction.options.getString("id_venda");
    const data = produtos.get(idVenda);

    if (!data) {
        return await interaction.editReply({ 
            content: `❌ O produto \`${idVenda}\` não existe na base de dados.` 
        });
    }

    try {
        // 2. Chama a função Painel (que agora deve usar a MessageCreate que criamos)
        // Passamos o interaction para que a função saiba em qual canal enviar
        await Painel(interaction, client, idVenda);
        
        // 3. Sucesso!
        await interaction.editReply({ 
            content: `✅ Vitrine do produto **${data.Config.name || idVenda}** enviada com sucesso!` 
        });

    } catch (error) {
        console.error("Erro ao enviar painel:", error);
        await interaction.editReply({ 
            content: `❌ Falha ao gerar painel. Erro: \`${error.message}\`` 
        });
    }
  }
}

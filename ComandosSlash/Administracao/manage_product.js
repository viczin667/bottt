const { PermissionFlagsBits, ApplicationCommandType, EmbedBuilder } = require("discord.js");
const { GerenciarCampos } = require("../../Functions/GerenciarCampos");
const { Emojis, perms } = require("../../DataBaseJson");

module.exports = {
  name: "manage_product",
  description: "🛠️ [Xenza] Configurar estrutura principal do produto",
  type: ApplicationCommandType.ChatInput,
  options: [{ 
    name: "product", 
    description: "Escolha o produto base para gerenciar", 
    type: 3, 
    required: true, 
    autocomplete: true 
  }],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    // Sistema de Permissão Híbrida (Owner + DB Staff)
    const isOwner = interaction.guild.ownerId === interaction.user.id;
    const isStaff = await perms.get(interaction.user.id);

    if (!isOwner && !isStaff) {
      return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} **Erro de Autoridade:** Apenas a gerência da Xenza pode alterar produtos.`, ephemeral: true });
    }

    const productValue = interaction.options.getString('product');

    if (!productValue || productValue === 'nada') {
      return interaction.reply({ content: `❌ Nenhum produto encontrado no banco de dados.`, ephemeral: true });
    }

    // Feedback visual para o Admin
    await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Abrindo painel de controle do produto...`, ephemeral: true });
    
    return GerenciarCampos(interaction, productValue);
  }
}

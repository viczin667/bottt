const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { GerenciarCampos } = require("../../Functions/GerenciarCampos");
const { Emojis, perms, produtos } = require("../../DataBaseJson");

module.exports = {
  name: "manage_product",
  description: "🛠️ [Xenza] Configurar estética e link do site",
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
    const isOwner = interaction.guild.ownerId === interaction.user.id;
    const isStaff = await perms.get(interaction.user.id);

    if (!isOwner && !isStaff) {
      return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} **Erro de Autoridade:** Acesso negado.`, ephemeral: true });
    }

    const productValue = interaction.options.getString('product');
    if (!productValue || productValue === 'nada') {
      return interaction.reply({ content: `❌ Nenhum produto encontrado.`, ephemeral: true });
    }

    // Feedback visual
    await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Abrindo painel de estética e configurações...`, ephemeral: true });
    
    // Essa função agora deve conter os botões para editar Cor, Banner e Link Feirafy
    return GerenciarCampos(interaction, productValue);
  }
}

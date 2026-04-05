const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { Emojis, perms } = require("../../DataBaseJson");

module.exports = {
  name: "manage_stock",
  description: "📦 [Xenza] Abastecer e gerenciar estoque interno",
  type: ApplicationCommandType.ChatInput,
  options: [{ 
    name: "item", 
    description: "Selecione o item para gerenciar o estoque", 
    type: 3, 
    required: true, 
    autocomplete: true 
  }],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    const isOwner = interaction.guild.ownerId === interaction.user.id;
    const isStaff = await perms.get(interaction.user.id);

    if (!isOwner && !isStaff) {
        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Acesso restrito ao estoque.`, ephemeral: true });
    }

    const itemValue = interaction.options.getString('item');
    if (!itemValue || itemValue === 'nada') return interaction.reply({ content: `❌ Selecione um item válido.`, ephemeral: true });

    const [produtoname, camponame] = itemValue.split('_');

    // Sincronização rápida para evitar timeout no Render
    await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Sincronizando banco de dados de estoque...`, ephemeral: true });

    return MessageStock(interaction, 1, produtoname, camponame);
  }
}

const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { Emojis, perms } = require("../../DataBaseJson");

module.exports = {
  name: "manage_item",
  description: "🏷️ [Xenza] Configurar variações e preços dos itens",
  type: ApplicationCommandType.ChatInput,
  options: [{ 
    name: "item", 
    description: "Escolha o item/variação específica", 
    type: 3, 
    required: true, 
    autocomplete: true 
  }],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    const isOwner = interaction.guild.ownerId === interaction.user.id;
    const isStaff = await perms.get(interaction.user.id);

    if (!isOwner && !isStaff) {
        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Permissão negada.`, ephemeral: true });
    }

    const itemValue = interaction.options.getString('item');
    if (!itemValue || itemValue === 'nada') return interaction.reply({ content: `❌ Nenhum item selecionado.`, ephemeral: true });

    try {
        const [produtoname, camponame] = itemValue.split('_');
        
        if (!produtoname || !camponame) {
            return interaction.reply({ content: "⚠️ Formato de item inválido.", ephemeral: true });
        }

        await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Carregando detalhes do item e valores...`, ephemeral: true });
        return GerenciarCampos2(interaction, camponame, produtoname);
        
    } catch (err) {
        return interaction.editReply({ content: "🔥 Erro crítico ao processar o item." });
    }
  }
}

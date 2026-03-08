const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { produtos } = require("../../DataBaseJson"); 
const config = require("../../config.json");

module.exports = {
    name: "gerenciar",
    description: "🕹️ [ADMIN] Gerenciar Preço/Estoque/Descrição.",
    options: [{ name: "id", description: "ID do produto", type: ApplicationCommandOptionType.String, required: true }],

    run: async (client, interaction) => {
        if (!config.owner.includes(interaction.user.id)) return;

        const id = interaction.options.getString("id");
        const prod = produtos.get(id);
        if (!prod) return interaction.reply({ content: "Produto não encontrado.", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle(`Painel de Gestão: ${id}`)
            .addFields(
                { name: "💰 Preço", value: `R$ ${prod.preco || 0}`, inline: true },
                { name: "📦 Estoque", value: `\`${(prod.estoque || []).length}\` itens`, inline: true }
            )
            .setColor("#2b2d31");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`edit_desc_${id}`).setLabel("Descrição").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`edit_price_${id}`).setLabel("Preço").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`add_stock_${id}`).setLabel("Add Estoque").setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

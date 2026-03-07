const { ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ModalBuilder, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function moedaConfig(interaction, client) {

        interaction.editReply({
            content: ``,
            embeds: [],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`selectMoedaC`)
                    .addOptions(
                        {
                            value: `realBRL`,
                            label: `Real Brasileiro`
                        },
                        {
                            value: `dolarUSD`,
                            label: `Dólar Americano (🚫)`
                        }
                    )
                    .setPlaceholder(`Clique aqui para selecionar a moeda`)
                    .setMaxValues(1)
                )
            ]
        })

}

module.exports = {
    moedaConfig
}
const { ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");
const { Painel, Gerenciar2 } = require("../Functions/Painel");

async function protectConfig(interaction, client) {

    const row1 = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`selectProtectBot`)
                .setOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Anti-Raid`)
                        .setValue(`sistemaAntiRaid`)
                        .setDescription(`Sistema Anti-Raid`)
                        .setEmoji(`1286081797297279091`),
                )
                .setPlaceholder(`Clique aqui para selecionar`)
                .setMaxValues(1)
        )

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId("voltar1").setLabel("Voltar").setEmoji(`1178068047202893869`).setStyle(2)
        )

    interaction.editReply({
        content: `Configurações de proteção.`,
        embeds: [],
        components: [row1, row2]
    })

}

module.exports = {
    protectConfig
}
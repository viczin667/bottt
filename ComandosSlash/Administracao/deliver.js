const { PermissionFlagsBits, EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { configuracao } = require("../../DataBaseJson");
const { EstatisticasStorm } = require("../../index.js");
const { Emojis } = require("../../DataBaseJson");
const { EntregarManual } = require("../../Functions/AprovarPagamento.js");

module.exports = {
    name: "deliver",
    description: "Use to deliver manually item",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "member",
            description: "-",
            type: 6,
            required: true
        },
        {
            name: "item",
            description: "-",
            type: 3,
            required: true,
            autocomplete: true
        },
        {
            name: "quanty",
            description: "-",
            type: 4,
            required: false
        }
    ],

    run: async (client, interaction, message) => {

        const perm = await getPermissions(client.user.id)
        if (perm === null || !perm.includes(interaction.user.id)) {
            return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Faltam permissões.`, ephemeral: true });
        }

        const member = interaction.options.getMember("member")
        const item = interaction.options._hoistedOptions[1].value
        const quanty = interaction.options.getInteger("quanty") || 1

        const botao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`deliver_${member.id}_${item}_${quanty}`)
                .setLabel('Sim, desejo entregar.')
                .setStyle(3)
        )

        await interaction.reply({ content: `Deseja entregar \`${quanty}\` de \`${item.split(`_`)[0]} - ${item.split(`_`)[1]}\` para ${member}?`, components: [botao], ephemeral: true }).then(async msg => {
            msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 360_000 }).on("collect", async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: `${Emojis.get(`negative_emoji`)} Apenas o usuário que executou o comando pode interagir.`, ephemeral: true })
                if (i.customId === `deliver_${member.id}_${item}_${quanty}`) {
                    EntregarManual(client, i, item, member, quanty)
                }
            }).on("end", async () => {
                await interaction.editReply({ content: `${Emojis.get(`warn_emoji`)} Tempo esgotado. ;)`, components: [] })
            })
        })
    }
}
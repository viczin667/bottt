const { ApplicationCommandOptionType, EmbedBuilder, ChannelType } = require("discord.js");
const { configuracao, configauth } = require("../../DataBaseJson"); // Suas DBs
const config = require("../../config.json");

module.exports = {
    name: "setconfig",
    description: "⚙️ [ADMIN] Configura canais de logs e segurança.",
    type: 1,
    options: [
        {
            name: "funcao",
            description: "O que configurar?",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Logs Mensagens", value: "mensagens" },
                { name: "Logs Voz/Tráfego", value: "tráfego" },
                { name: "Logs Perfil", value: "perfil" },
                { name: "Logs Segurança (VPN)", value: "seguranca" }
            ]
        },
        {
            name: "canal",
            description: "Selecione o canal",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true
        }
    ],

    run: async (client, interaction) => {
        if (!config.owner.includes(interaction.user.id)) return interaction.reply({ content: "Apenas o dono pode configurar.", ephemeral: true });

        const funcao = interaction.options.getString("funcao");
        const canal = interaction.options.getChannel("canal");

        if (funcao === "seguranca") {
            configauth.set(`${interaction.guild.id}.logs`, canal.id); //
        } else {
            configuracao.set(`ConfigChannels.${funcao}`, canal.id); //
        }

        const embed = new EmbedBuilder()
            .setTitle("Xenza - Configuração Salva")
            .setDescription(`✅ O canal de **${funcao}** foi definido para ${canal}.`)
            .setColor("#5865F2");

        await interaction.reply({ embeds: [embed] });
    }
};

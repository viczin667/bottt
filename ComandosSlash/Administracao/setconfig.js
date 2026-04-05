const { ApplicationCommandOptionType, EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const { configuracao, configauth } = require("../../DataBaseJson"); 
const config = require("../../config.json");

module.exports = {
    name: "setconfig",
    description: "⚙️ [ADMIN] Configura logs, segurança e canais de vendas.",
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
                { name: "Logs Segurança (VPN)", value: "seguranca" },
                { name: "Sistema de Vendas/Ticket", value: "vendas" } // NOVA OPÇÃO
            ]
        },
        {
            name: "canal",
            description: "Selecione o canal",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true
        },
        {
            name: "id_produto",
            description: "ID do serviço (Ex: roblox, netflix, host) - Apenas para Vendas",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "formulario",
            description: "Ativar formulário de perguntas? - Apenas para Vendas",
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }
    ],

    run: async (client, interaction) => {
        // Verifica se é o dono ou admin do servidor
        if (!config.owner.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Você não tem permissão para usar este comando.", ephemeral: true });
        }

        const funcao = interaction.options.getString("funcao");
        const canal = interaction.options.getChannel("canal");
        const idProduto = interaction.options.getString("id_produto") || "geral";
        const formAtivo = interaction.options.getBoolean("formulario") || false;

        // LÓGICA DE CONFIGURAÇÃO
        if (funcao === "seguranca") {
            configauth.set(`${interaction.guild.id}.logs`, canal.id);
        } else if (funcao === "vendas") {
            // Salva as regras do canal de venda de forma dinâmica
            configuracao.set(`VendasAtivas.${canal.id}`, {
                id: idProduto,
                formulario: formAtivo,
                configurado_por: interaction.user.id,
                data: Date.now()
            });
        } else {
            configuracao.set(`ConfigChannels.${funcao}`, canal.id);
        }

        const embed = new EmbedBuilder()
            .setTitle("Xenza - Configuração Atualizada")
            .setColor("#5865F2")
            .setTimestamp()
            .setFooter({ text: `Configurado por ${interaction.user.tag}` });

        if (funcao === "vendas") {
            embed.setDescription(`✅ **Canal de Vendas Configurado!**\n\n**Canal:** ${canal}\n**Produto/ID:** \`${idProduto}\`\n**Formulário:** ${formAtivo ? "🟢 Ativado" : "🔴 Desativado"}`);
        } else {
            embed.setDescription(`✅ O canal de **${funcao}** foi definido para ${canal}.`);
        }

        await interaction.reply({ embeds: [embed] });
    }
};

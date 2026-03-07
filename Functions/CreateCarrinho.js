const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ChannelType } = require("discord.js");
const { configuracao, produtos, Emojis } = require("../DataBaseJson");
const { DentroCarrinho1 } = require("./DentroCarrinho");
const { carrinhos } = require("../DataBaseJson");
const { owner } = require("../config.json");

function VerificaçõesCarrinho(infos) {
    if (infos.estoque <= 0) return { error: 400, message: `Sem Stock Disponível` };
    return { status: 202 };
}

async function CreateCarrinho(interaction, infos, client) {
    await interaction.reply({ content: ` Aguarde...`, ephemeral: true })


    const logPedidosId = configuracao.get(`ConfigChannels.logpedidos`);
    if (!logPedidosId || logPedidosId === "null" || logPedidosId === "") {
        return interaction.editReply({
            content: ``,
            embeds: [new EmbedBuilder()
                .setDescription(`Ops... o canal de logs pedidos ainda não foi configurado, faça um retorno em breve!`)
                .setColor(`${configuracao.get(`Cores.Erro`) == null ? 'ff0000' : configuracao.get('Cores.Erro')}`)
            ],
            ephemeral: true
        });
    }

    if (configuracao.get(`pagamentos.MpOnOff`) != true && configuracao.get(`pagamentos.SemiAutomatico.status`) != true && configuracao.get(`pagamentos.EfiOnOff`) != true) {
        return interaction.editReply({
            content: ``,
            embeds: [new EmbedBuilder()
                .setDescription(`Ops... a forma de pagamento não foi configurada ainda, faça um retorno em breve!`)
                .setColor(`${configuracao.get(`Cores.Erro`) == null ? 'ff0000' : configuracao.get('Cores.Erro')}`)
            ],
            ephemeral: true
        });
    }

    interaction.editReply({ content: ` Aguarde, prosseguindo...`, ephemeral: true }).then(async msg => {
        interaction.editReply({ content: ` Aguarde, verificando condições...`, ephemeral: true });

        const cartThread = interaction.channel.threads.cache.find(x => x.name.includes(interaction.user.id) && x.name.startsWith('🛒'));
        const exchangeThread = interaction.channel.threads.cache.find(x => x.name.includes(interaction.user.id) && x.name.startsWith('💱'));

        if (cartThread !== undefined || exchangeThread !== undefined) {
            const row4 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${cartThread ? cartThread.id : exchangeThread.id}`)
                        .setLabel('Ir para o carrinho')
                        .setStyle(5)
                );

            interaction.editReply({ content: ` Você já possui um carrinho aberto.`, components: [row4] });
            return;
        }

        const thread = await interaction.channel.threads.create({
            name: `🛒・${interaction.user.username}・${interaction.user.id}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: 'Needed a separate thread for moderation',
            members: [interaction.user.id],
        });

        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread.id}`)
                    .setLabel('Ir para o carrinho')
                    .setStyle(5)
            );

        interaction.editReply({ content: ` Aguarde, criando carrinho...`, ephemeral: true });

        interaction.editReply({ content: ` Seu carrinho foi criado com êxito.`, components: [row4] });
        await carrinhos.set(thread.id, { user: interaction.user.id, guild: interaction.guild.id, threadid: thread.id, infos: infos });
        DentroCarrinho1(thread, undefined, client);
    });
}

module.exports = {
    VerificaçõesCarrinho,
    CreateCarrinho
};
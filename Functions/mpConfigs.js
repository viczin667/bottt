const { ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ModalBuilder, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Emoji } = require("discord.js");
const { configuracao, Emojis, refounds } = require("../DataBaseJson");



async function mpConfigs(interaction) {

    const blockedBanksArray = configuracao.get(`pagamentos.BancosBloqueados`) || [];

    const BancosBloqueados = blockedBanksArray.map(bank => `${bank} `).join('\n')

    const embedx = new EmbedBuilder()
        .setTitle(`Configurar Mercado Pago`)
        .setDescription(`Aqui, você pode configurar tudo referente ao Mercado Pago. Pode definir ou redefinir seu access token, vincular seu mercado pago caso seja de menor e queira fazer vendas automáticas (botão "Autorizar"), bloquear ou desbloquear bancos que não deseja aceitar pagamentos e editar as formas de pagamento que serão aceitas por ele.`)
        .setFields(
            { name: `${Emojis.get(`pix_stamp_emoji`)} Pagamentos via PIX`, value: `${configuracao.get(`pagamentos.MpOnOff`) ? `${Emojis.get(`confirmed_emoji`)} **Ativo**` : `${Emojis.get(`negative_emoji`)} **Desabilitado**`}`, inline: true },
            { name: `${Emojis.get(`card_stamp_emoji`)} Pagamentos via Site`, value: configuracao.get(`pagamentos.MpSite`) ? `${Emojis.get(`confirmed_emoji`)} **Ativo**` : `${Emojis.get(`negative_emoji`)} **Desabilitado**`, inline: true },
            { name: `${Emojis.get(`brand_emoji`)} Tempo para pagar`, value: `${Emojis.get(`clock_emoji`)} ${configuracao.get(`ConfigCarrinho.inatividade`)} minutos`, inline: true },
            // { name: `Métodos De Pagamento`, value: `- \`Pix\` - Checkout transparente \`[${configuracao.get(`pagamentos.MpOnOff`) ? `Ativo` : `inativo`}]\`\n- \`Site\` - Checkout transparente \`[${configuracao.get(`pagamentos.MpSite`) ? `Ativo` : `inativo`}]\`` },
            { name: `${Emojis.get(`_mp_emoji`)} Access Token`, value: `-# *Não compartilhe com ninguem*\n${configuracao.get(`pagamentos.MpAPI`) == "" ? `\`\`\`APP_USR-000000000000000-XXXXXXX\`\`\`` : `\`\`\`${configuracao.get(`pagamentos.MpAPI`).slice(0, 30) + '*****************'}\`\`\``}` },
            { name: `${Emojis.get(`_fixe_emoji`)} Bancos Bloqueados`, value: `${blockedBanksArray.length <= 0 ? `Nenhum` : `\`\`\`${BancosBloqueados}\`\`\``}` }
        )
        .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
        .setFooter(
            { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
        )
        .setTimestamp()

    // const fernandona = new ActionRowBuilder()
    //     .addComponents(
    //         new ButtonBuilder()
    //             .setCustomId("+18porra")
    //             .setLabel('Definir Access Token')
    //             .setEmoji(`1238417619657424929`)
    //             .setStyle(1)
    //             .setDisabled(false),
    //         new ButtonBuilder()
    //             .setCustomId("-18porra")
    //             .setLabel('Autorizar (Menores de Idade)')
    //             .setEmoji(`1238418449772843069`)
    //             .setStyle(3)
    //             .setDisabled(true)
    //     )

    const fernandona1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("onOffMp")
                .setLabel(configuracao.get(`pagamentos.MpOnOff`) ? `Pix ativado` : `Pix desativado`)
                .setEmoji(Emojis.get(`_transfer_emoji`))
                .setStyle(configuracao.get(`pagamentos.MpOnOff`) ? 3 : 4)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId("alterarSiteMp")
                .setLabel(configuracao.get(`pagamentos.MpSite`) ? `Site ativado` : `Site desativado`)
                .setEmoji(Emojis.get(`_transfer_emoji`))
                .setStyle(configuracao.get(`pagamentos.MpSite`) ? 3 : 4),
            new ButtonBuilder()
                .setCustomId("automaticTempo")
                .setLabel('Alterar Tempo para Pagar')
                .setEmoji(`1229787808936230975`)
                .setStyle(2),
        )

    // const fernandona2 = new ActionRowBuilder()
    //     .addComponents(
    //         new ButtonBuilder()
    //             .setCustomId("bloquearbancos")
    //             .setLabel('Bloquear Banco')
    //             .setEmoji(`1238417761554927617`)
    //             .setStyle(2)
    //             .setDisabled(false),
    //         new ButtonBuilder()
    //             .setCustomId("exemplesbancks")
    //             .setLabel('Exemplos Bancos')
    //             .setEmoji(`1238417688129310782`)
    //             .setStyle(2)
    //             .setDisabled(false)
    //     )

    const fernandona3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("formasdepagamentos")
            .setLabel('Voltar')
            .setEmoji(`1238413255886639104`)
            .setStyle(2),
    )

    const selectmenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`configurarmpselect`)
            .setPlaceholder(`Configure o recebimento pelo Mercado Pago`)
            .setMaxValues(1)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Alterar Access Token`)
                    .setValue(`alterarAccessToken`)
                    .setDescription(`Configure o token de acesso do Mercado Pago`)
                    .setEmoji(Emojis.get(`_mp_emoji`)),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Bloquear Banco`)
                    .setValue(`bloquearBanco`)
                    .setDescription(`Bloqueie bancos específicos de depositarem`)
                    .setEmoji(`1244438113368150061`),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Bloquear Usuário`)
                    .setValue(`bloquearUsuario`)
                    .setDescription(`Bloqueie usuários específicos de depositarem`)
                    .setEmoji(Emojis.get(`_silueta_emoji`)),

            )
    )


    await interaction.update({ embeds: [embedx], components: [fernandona1, selectmenu, fernandona3], content: `` })
}
async function BloquearConta(client, interaction) {

    let contas = configuracao.get(`pagamentos.ContasBloqueados`) || [];
    const contasArray = contas.map(conta => `${conta}`).join('\n')

    const embedx = new EmbedBuilder()
        .setTitle(`Contas Bloqueadas`)
        .setDescription(`Configure os bancos que serão bloqueados no sistema de pagamento Mercado Pago, caso o seu bot receba pagamentos de algum desses bancos, a transação será recusada.`)
        .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
        .setFooter(
            { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
        )
        .setTimestamp()

    const selectmenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`bloquearcontaselect`)
            .setPlaceholder(`Selecione uma opção`)
            .setMaxValues(1)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Bloquear Conta`)
                    .setValue(`bloquearConta`)
                    .setDescription(`Bloqueie contas específicas de depositarem`)
                    .setEmoji(Emojis.get(`_silueta_emoji`)),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Desbloquear Conta`)
                    .setValue(`desbloquearConta`)
                    .setDescription(`Desbloqueie contas específicas de depositarem`)
                    .setEmoji(Emojis.get(`_multi_silueta_emoji`)),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Ver Contas Bloqueadas`)
                    .setValue(`verContas`)
                    .setDescription(`Veja as contas que estão bloqueadas`)
                    .setEmoji(Emojis.get(`_folder_emoji`)),
            )
    )

    const botaovoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("configurarmercadopago")
            .setLabel('Voltar')
            .setEmoji(`1238413255886639104`)
            .setStyle(2),
    )

    await interaction.update({ embeds: [embedx], components: [selectmenu, botaovoltar], content: `` })
}
async function BloquearBancos(client, interaction) {

    let refunded = await refounds.fetchAll();
    let opcoes = {};

    for (const element of refunded) {
        let banco = element.data.banco;
        let valor = element.data.transaction_amount;
        let quantidade = element.data.quantidade || 1;

        if (opcoes[banco]) {
            opcoes[banco].value += valor;
            opcoes[banco].quantidade += quantidade;
        } else {
            opcoes[banco] = {
                label: banco,
                value: valor,
                quantidade: quantidade
            };
        }
    }

    let opcoesArray = Object.values(opcoes).map(({ label, value, quantidade }) => {
        return {
            label: label,
            value: label,
            description: `${quantidade} fraudes, total de ${Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        };
    });

    opcoesArray.sort((a, b) => {
        const totalA = opcoes[a.value]?.value;
        const totalB = opcoes[b.value]?.value;
        return totalB - totalA;
    });

    const selectmenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`bloquearbancosselect`)
            .setPlaceholder(`Selecione um banco para bloquear`)
            .setMaxValues(opcoesArray.length)
            .addOptions(...opcoesArray)
    );


    const blockedBanksArray = configuracao.get(`pagamentos.BancosBloqueados`) || [];

    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`liberarbanco`)
            .setLabel(`Liberar Banco`)
            .setEmoji(Emojis.get(`_trash_emoji`))
            .setDisabled(blockedBanksArray.length <= 0)
            .setStyle(2),
    )

    const botaovoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("configurarmercadopago")
            .setLabel('Voltar')
            .setEmoji(`1238413255886639104`)
            .setStyle(2),
    )

    await interaction.update({ components: [selectmenu, botao, botaovoltar] })
}

module.exports = {
    mpConfigs,
    BloquearBancos,
    BloquearConta
}

const Discord = require("discord.js")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const { produtos, configuracao, Compras } = require("../../DataBaseJson");
const { QuickDB } = require("quick.db");
const { GerenciarCampos, GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { MessageCreate, UpdateMessageProduto } = require("../../Functions/SenderMessagesOrUpdates");
const db = new QuickDB();
const { owner } = require('../../config.json');
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isChannelSelectMenu()) {

            if (interaction.customId == 'selecionarcanalpostar') {

                MessageCreate(interaction, client)


            }

        }


        if (interaction.type == Discord.InteractionType.ModalSubmit) {
            if (interaction.customId === 'awdawdawdawdadawdawfewfryty565') {

                let a1 = interaction.fields.getTextInputValue('tokenMP');
                const ggg = await db.get(interaction.message.id)



                const selectaaa = new Discord.ChannelSelectMenuBuilder()
                    .setCustomId('selecionarcanalpostar')
                    .setPlaceholder('Clique aqui para selecionar')
                    .setChannelTypes(Discord.ChannelType.GuildText)

                const row1 = new ActionRowBuilder()
                    .addComponents(selectaaa);

                interaction.reply({ components: [row1], content: `Selecione o canal onde quer postar a mensagem.`, ephemeral: true, })


                if (a1 == '') a1 = '#0cd4cc'

                db.set(`${interaction.user.id}_colocarvenda`, { produto: ggg.name, colorembed: a1 })
            } else if (interaction.customId === 'awdawdawdawdawdwadwadawdwaadawdawfewfryty565') {
                let a1 = interaction.fields.getTextInputValue('tokenMP');
                let a2 = interaction.fields.getTextInputValue('tokenMP2');
                let a3 = interaction.fields.getTextInputValue('tokenMP3');
                let a4 = interaction.fields.getTextInputValue('tokenMP4');

                if (a4 !== '') {
                    const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

                    if (!hexColorRegex.test(a4)) return interaction.reply({ content: ` Código Hex Color inválido.`, ephemeral: true })
                }

                const ggg = await db.get(interaction.message.id)

                if (a3 !== '') {
                    if (a3 !== 'verde' && a3 !== 'azul' && a3 !== 'cinza' && a3 !== 'vermelho') return interaction.reply({ content: `Você interagiu incorretamente no estilo do Button`, ephemeral: true })
                } else {
                    a3 = 'cinza'
                }

                if (a1 == '') a1 = '<:carrin:1191792807451562004>'

                if (a2 == '') a2 = 'Comprar'

                if (a4 == '') a4 = '#0cd4cc'


                const emojiRegex = /^<:.+:\d+>$|^<a:.+:\d+>$|^\p{Emoji}$/u;
                if (!emojiRegex.test(a1)) {
                    a1 = '<:carrin:1191792807451562004>';
                }


                db.set(`${interaction.user.id}_colocarvenda`, { produto: ggg.name, emoji: a1, textobutton: a2, estilobutton: a3, colorembed: a4 })

                const selectaaa = new Discord.ChannelSelectMenuBuilder()
                    .setCustomId('selecionarcanalpostar')
                    .setPlaceholder('Clique aqui para selecionar')
                    .setChannelTypes(Discord.ChannelType.GuildText)

                const row1 = new ActionRowBuilder()
                    .addComponents(selectaaa);

                interaction.reply({ components: [row1], content: `Selecione o canal onde quer postar a mensagem.`, ephemeral: true, })

            }


            if (interaction.customId.startsWith('wdawdawdawdwadadsadawdwadwdw')) {
                let a1 = interaction.fields.getTextInputValue('tokenMP');
                if (a1 !== 'sim') return interaction.reply({ content: ` Ação não validada para realizar reembolso.`, ephemeral: true })
                const id = interaction.customId.split('_')[1]
                await interaction.reply({ content: ` Estornando pagamento...`, ephemeral: true })

                const axios = require('axios');
                const fs = require('fs');

                let refundResponse;

                if (configuracao.get(`pagamentos.EfiOnOff`) != true) {
                    refundResponse = await axios.post(`https://api.mercadopago.com/v1/payments/${id}/refunds`, {}, {
                        headers: {
                            'Authorization': `Bearer ${configuracao.get('pagamentos.MpAPI')}`
                        }
                    });

                    if (refundResponse.status !== 201) {
                        return interaction.editReply({ content: ` Erro ao estornar pagamento.`, ephemeral: true })
                    }
                } else {
                    const fs = require("fs");
                    const https = require("https");

                    const certificado = fs.readFileSync(`./Eventos/Sistema De Configuracao/${configuracao.get(`pagamentos.EfiAPI.certificado`)}`);

                    const agent = new https.Agent({
                        pfx: certificado,
                        passphrase: "",
                    });

                    const auth = Buffer.from(`${configuracao.get(`pagamentos.EfiAPI.client_id`)}:${configuracao.get(`pagamentos.EfiAPI.client_secret`)}`).toString("base64");

                    const data2 = JSON.stringify({
                        grant_type: "client_credentials",
                    });

                    var config = {
                        method: "POST",
                        url: "https://pix.api.efipay.com.br/oauth/token",
                        headers: {
                            Authorization: "Basic " + auth,
                            "Content-Type": "application/json",
                        },
                        httpsAgent: agent,
                        data: data2,
                    };

                    let access_token = await axios(config).then((response) => {
                        return response.data.access_token;
                    })

                    let endToEndId = await axios.get(`https://pix.api.efipay.com.br/v2/cob/${id}`, {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            "Content-Type": "application/json",
                        },
                        httpsAgent: agent,
                    }
                    ).then((response) => {
                        return response.data.pix[0].endToEndId
                    })
                    let compras = Compras.get('Compras')
                    let compra = compras.find(x => x.id == id)

                    var config = {
                        method: "PUT",
                        url: `https://pix.api.efipay.com.br/v2/pix/${endToEndId}/devolucao/${id}`,
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            "Content-Type": "application/json",
                        },
                        httpsAgent: agent,
                        data: {
                            valor: `${compra.valor.toFixed(2)}`,
                        },
                    };

                    refundResponse = await axios(config).then((response) => {
                        return response.data;
                    }).catch((error) => {
                        return error.response.data;
                    });

                   if (refundResponse.status !== 'EM_PROCESSAMENTO') {
                        return interaction.editReply({ content: ` Erro ao estornar pagamento.`, ephemeral: true })
                   }
                }


                let compras = Compras.get('Compras')
                let compra = compras.find(x => x.id == id)

                if (compra) {
                    compra.refund = true
                    compras.refundedby = `${interaction.user.id}`
                    Compras.set('Compras', compras)
                }

                let embed = new EmbedBuilder(interaction.message.embeds[0])
                await embed.setColor(`Red`)
                await embed.addFields({ name: 'Reembolso', value: `${interaction.user} efetuou o reembolso <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true })
                await interaction.message.edit({ embeds: [embed], components: [] })
                interaction.editReply({ content: ` Pagamento estornado com sucesso.` })
            }

        }


        if (interaction.isButton()) {

            if (interaction.customId.startsWith('refoundd_')) {

                const ownerIdList = owner;

                if (!ownerIdList.includes(interaction.user.id)) {
                    await interaction.reply({
                        content: ` Você não possui permissão para realizar um estorno.`,
                        ephemeral: true
                    });
                    return;
                }

                const modalaAA = new ModalBuilder()
                    .setCustomId(`wdawdawdawdwadadsadawdwadwdw_${interaction.customId.split('_')[1]}`)
                    .setTitle(`Estorno de pagamento`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Confirmação de estorno`)
                    .setPlaceholder(`digite 'sim' para confirmar.`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN)

                modalaAA.addComponents(firstActionRow3);
                await interaction.showModal(modalaAA);
            }




            if (interaction.customId == 'syncproduto') {
                const ggg = await db.get(interaction.message.id)

                await interaction.reply({ content: ` Sincronizando mensagens...`, ephemeral: true }).then(async msg => {
                    await UpdateMessageProduto(client, ggg.name)

                    msg.edit({ content: ` Mensagens sincronizadas.` })

                })
            }


            if (interaction.customId == 'colocarvenda') {

                const ggg = await db.get(interaction.message.id)

                const gg2 = produtos.get(`${ggg.name}.Campos`)

                if (gg2.length == 0) return interaction.reply({ content: ` Nenhum campo foi configurado.`, ephemeral: true })

                if (gg2.length > 1) {

                    const modalaAA = new ModalBuilder()
                        .setCustomId('awdawdawdawdadawdawfewfryty565')
                        .setTitle(`Personalização Opcional`);

                    const newnameboteN = new TextInputBuilder()
                        .setCustomId('tokenMP')
                        .setLabel(`COR DO EMBED`)
                        .setPlaceholder(`Insira aqui um código Hex Color, ex: FFFFFF`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)


                    const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN)



                    modalaAA.addComponents(firstActionRow3);
                    await interaction.showModal(modalaAA);
                } else {

                    const modalaAA = new ModalBuilder()
                        .setCustomId('awdawdawdawdawdwadwadawdwaadawdawfewfryty565')
                        .setTitle(`Personalização Opcional`);

                    const newnameboteN = new TextInputBuilder()
                        .setCustomId('tokenMP')
                        .setLabel(`EMOJI`)
                        .setPlaceholder(`Insira aqui um id ou nome de emoji personalizado`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)

                    const newnameboteN2 = new TextInputBuilder()
                        .setCustomId('tokenMP2')
                        .setLabel(`TEXTO DO BOTÃO`)
                        .setPlaceholder(`Insira aqui nome personalizado, ex: Comprar`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)

                    const newnameboteN3 = new TextInputBuilder()
                        .setCustomId('tokenMP3')
                        .setLabel(`ESTILO DO BOTÃO`)
                        .setPlaceholder(`Insira aqui, verde, azul, cinza ou vermelho.`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)

                    const newnameboteN4 = new TextInputBuilder()
                        .setCustomId('tokenMP4')
                        .setLabel(`COR DO EMBED`)
                        .setPlaceholder(`Insira aqui um código Hex Color, ex: FFFFFF`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)


                    const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN)
                    const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2)
                    const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN3)
                    const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN4)



                    modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6);
                    await interaction.showModal(modalaAA);

                }
            }
        }

    }
}
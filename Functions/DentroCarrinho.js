
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require("discord.js")
const { produtos, carrinhos, pagamentos, configuracao, Emojis } = require("../DataBaseJson")
const { QuickDB } = require("quick.db");
const { owner } = require("../config.json");
const db = new QuickDB();
const axios = require("axios");
const https = require("https");
const fs = require("fs");

// Inicialização do MercadoPago SDK v2.x
let mercadopago;
try {
    const MP = require("mercadopago");
    mercadopago = new MP.MercadoPagoConfig({ 
        accessToken: configuracao.get('pagamentos.MpAPI') || '' 
    });
} catch (error) {
    console.log('Erro ao inicializar MercadoPago:', error.message);
    mercadopago = null;
}

async function DentroCarrinhoEfiBank(client, interaction) {
    await interaction.update({ content: ` Aguarde...`, flags: [4096], components: [], embeds: [] })

    try {
        interaction.editReply({ content: ` Criando seu pagamento...`, flags: [4096], components: [], embeds: [] })
        let certificado = fs.readFileSync(`./Eventos/Sistema De Configuracao/${configuracao.get("pagamentos.EfiAPI.certificado")}`);

        const httpsAgent = new https.Agent({
            pfx: certificado,
            passphrase: "",
        });

        var data = JSON.stringify({ grant_type: "client_credentials" });
        var data_credentials = configuracao.get(`pagamentos.EfiAPI.client_id`) + ":" + configuracao.get(`pagamentos.EfiAPI.client_secret`);
        var auth = Buffer.from(data_credentials).toString("base64");


        var config = {
            method: "POST",
            url: "https://pix.api.efipay.com.br/oauth/token",
            headers: {
                Authorization: "Basic " + auth,
                "Content-Type": "application/json",
            },
            httpsAgent: httpsAgent,
            data: data,
        };

        const access_token_res = await axios(config).catch(err => {
            console.log(`Erro ao obter token Efi: ${err.message}`);
            return null;
        });
        const access_token = access_token_res ? access_token_res.data.access_token : null;
        if (!access_token) throw new Error("Não foi possível obter o token de acesso do Efi Bank.");
        
        const yy = await carrinhos.get(interaction.channel.id)
        const hhhh = produtos.get(`${yy.infos.produto}.Campos`)
        const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo)

        let valor = 0

        if (yy.cupomadicionado !== undefined) {
            const valor2 = gggaaa.valor * yy.quantidadeselecionada

            const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
            const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
            valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
        } else {
            valor = gggaaa.valor * yy.quantidadeselecionada
        }

        interaction.editReply({ content: ` Espere só mais um pouco...`, flags: [4096], components: [], embeds: [] })


        var data = JSON.stringify({
            "calendario": {
                "expiracao": 10 * 60
            },
            "devedor": {
                "cpf": "12345678909",
                "nome": `${interaction.user.username}`,
            },
            "valor": {
                "original": `${valor.toFixed(2)}`,
            },
            "chave": `${configuracao.get(`pagamentos.EfiAPI.chavepix`)}`,
            "solicitacaoPagador": "Cobrança dos serviços prestados."
        });

        var config = {
            method: "post",
            url: "https://pix.api.efipay.com.br/v2/cob",
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            httpsAgent: httpsAgent,
            data: data,
        };

        let response = await axios(config).then(function (response) {
            return response.data
        }).catch(function (error) {
            console.log(error.response.data)
        })

        const { qrGenerator } = require('../Lib/QRCodeLib')
        const qr = new qrGenerator({ imagePath: './Lib/aaaaa.png' })
        const qrcode = await qr.generate(response.pixCopiaECola)

        const buffer = Buffer.from(qrcode.response, "base64");
        const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

        const embed = new EmbedBuilder()
            .setColor(`${configuracao.get(`QRCode.principal`) || `#328dbc`}`)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) ? interaction.user.displayAvatarURL({ dynamic: true }) : null })
            .setTitle(` Pagamento via PIX criado`)
            .addFields(
                { name: ` Expira em:`, value: `<t:${Math.floor(Date.now() / 1000) + 600}:R>` },
                { name: ` Código Copia e Cola:`, value: `\`\`\`${response.pixCopiaECola}\`\`\`` }
            )
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
            .setTimestamp()

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("codigocopiaecola")
                    .setLabel('Código copia e cola')
                    .setEmoji(`1237902888592867358`)
                    .setStyle(2),
                new ButtonBuilder()
                    .setCustomId("deletchannel")
                    .setLabel('Cancelar')
                    .setStyle(4)

            )

        if (configuracao.get(`pagamentos.QRCode`) == `miniatura`) {
            embed.setDescription(`Se preferir pagar via QR code, basta clicar na imagem ao lado.`)
            embed.setThumbnail(`attachment://payment.png`)
        } else {
            embed.setImage('attachment://payment.png')
        }

        pagamentos.set(`${interaction.channel.id}`, { method: 'pix', tipo: `pix` })
        carrinhos.set(`${interaction.channel.id}.pagamentos`, { id: response.txid, cp: response.pixCopiaECola, method: 'pix' })
        pagamentos.set(`${interaction.channel.id}.pagamentos`, { id: response.txid, cp: response.pixCopiaECola, method: 'pix', data: Date.now() })

        await interaction.editReply({ embeds: [embed], files: [attachment], content: ``, components: [row3] })

        interaction.channel.setName(`💱・${interaction.user.username}・${interaction.user.id}`)

        const mandanopvdocara = new EmbedBuilder()
            .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
            .setTitle(` Pedido solicitado`)
            .setFooter(
                { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
            )
            .setTimestamp()
            .setDescription(`Seu pedido foi criado e agora está aguardando a confirmação do pagamento`)
            .addFields(
                { name: `Detalhes`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                { name: `ID do Pedido`, value: `\`${response.txid}\`` },
                { name: `Forma de Pagamento`, value: ` \`Pix - Efi Bank\`` }
            )

        try {
            await interaction.user.send({ embeds: [mandanopvdocara] })
        } catch (error) {

        }

        const dsfjmsdfjnsdfj = new EmbedBuilder()
            .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
            .setTitle(` Pedido solicitado`)
            .setDescription(`Usuário ${interaction.user} solicitou um pedido.`)
            .addFields(
                { name: `Detalhes`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                { name: `ID do Pedido`, value: `\`${response.txid}\`` },
                { name: `Forma de pagamento`, value: ` \`Pix - Efi Bank\`` }
            )
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
            .setTimestamp()

        try {
          const logChannelId = configuracao.get(`ConfigChannels.logpedidos`);
        const logChannel = (logChannelId && logChannelId !== "null") ? await client.channels.fetch(logChannelId).catch(() => null) : null;
        if (logChannel) {
            await logChannel.send({ embeds: [dsfjmsdfjnsdfj] }).then(yyyyy => {
                carrinhos.set(`${interaction.channel.id}.replys`, { channelid: yyyyy.channel.id, idmsg: yyyyy.id })
            })
        }
    } catch (error) {
        // Erro silencioso no log
    }
    } catch (error) {
        console.log(error)
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("pagarpix")
                .setLabel('Pix')
                .setEmoji(`1238293609380450304`)
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("pagarcrypto")
                .setLabel('Litecoin')
                .setEmoji(`1256688031088513064`)
                .setStyle(2)
                .setDisabled(true)

        )

        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("pagarCard")
                .setLabel(`Cartão de Crédito/Débito`)
                .setEmoji('1256688008653045831')
                .setStyle(2)
                .setDisabled(configuracao.get(`pagamentos.MpSite`) == true ? false : true)

        )

        const row5 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("voltarcarrinho")
                .setEmoji('1237191329432211468')
                .setStyle(2)

        )

        interaction.editReply({ content: `Selecione uma forma de pagamento.`, flags: [4096], components: [row3, row4, row5] })
        interaction.followUp({ content: ` Ocorreu um erro ao criar o pagamento, tente novamente.\nError: ${error}`, flags: [4096] })
    }
}
async function DentroCarrinhoPix(interaction, client) {
    interaction.deferUpdate()
    await interaction.message.edit({ content: ` Criando seu carrinho...`, flags: [4096], components: [] }).then(async tt => {

        const user = await generateRandomUser();
        const yy = await carrinhos.get(interaction.channel.id)
        const hhhh = produtos.get(`${yy.infos.produto}.Campos`)
        const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo)


        let valor = 0

        if (yy.cupomadicionado !== undefined) {
            const valor2 = gggaaa.valor * yy.quantidadeselecionada

            const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
            const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
            valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
        } else {
            valor = gggaaa.valor * yy.quantidadeselecionada
        }


        const aaaa = Number(valor).toFixed(2)


        var agora = new Date();
        agora.setMinutes(agora.getMinutes() + 10);
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() + 240);
        agora.setHours(agora.getHours() - 5)
        var novaDataFormatada = agora.toISOString().replace('Z', '-04:00');



        var payment_data = {
            transaction_amount: Number(aaaa),
            description: `Pagamento - ${interaction.user.username}`,
            date_of_expiration: `${novaDataFormatada}`,
            payment_method_id: 'pix',
            payer: {
                email: user.email, // Usando o email gerado aleatoriamente.
                first_name: user.firstName,
                last_name: user.lastName,
                identification: {
                    type: 'CPF',
                    number: user.cpf
                },

                address: {
                    zip_code: '86063190',
                    street_name: 'Rua Jácomo Piccinin',
                    street_number: '168',
                    neighborhood: 'Pinheiros',
                    city: 'Londrina',
                    federal_unit: 'PR'
                }
            }
        }
        if (!mercadopago) {
            throw new Error('Módulo mercadopago não está disponível. Verifique se está instalado corretamente.');
        }
        
        // SDK v2.x do MercadoPago usa uma nova API
        const MP = require("mercadopago");
        const client = new MP.MercadoPagoConfig({ accessToken: configuracao.get('pagamentos.MpAPI') });
        const payment = new MP.Payment(client);
        
        await payment.create({ body: payment_data })
            .then(async function (response) {
                // No SDK v2.x, a resposta vem diretamente, não em .body
                const data = response.body || response;



                const { qrGenerator } = require('../Lib/QRCodeLib')
                const qr = new qrGenerator({ imagePath: './Lib/aaaaa.png' })
                const qrcode = await qr.generate(data.point_of_interaction.transaction_data.qr_code)


                const buffer = Buffer.from(qrcode.response, "base64");
                const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

                const embed = new EmbedBuilder()
                    .setColor(`${configuracao.get(`QRCode.principal`) || `#328dbc`}`)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) ? interaction.user.displayAvatarURL({ dynamic: true }) : null })
                    .setTitle(` Pagamento via PIX criado`)
                    .addFields(
                        { name: ` Expira em:`, value: `<t:${Math.floor(Date.now() / 1000) + 600}:R>` },
                        { name: ` Código Copia e Cola:`, value: `\`\`\`${data.point_of_interaction.transaction_data.qr_code}\`\`\`` }
                    )
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
                    .setTimestamp()
                    .setImage(`https://cdn.discordapp.com/attachments/1179498681481830542/1179499043777429615/qr_code.png?ex=657a0116&is=65678c16&hm=83a7242c9f6a72f9128da76b14ede8ee1df01f5ba0ed0799f8c753b92fa8ede0&`)



                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("codigocopiaecola")
                            .setLabel('Código copia e cola')
                            .setEmoji(`1237902888592867358`)
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId("deletchannel")
                            .setLabel('Cancelar')
                            .setStyle(4)

                    )

                if (configuracao.get(`pagamentos.QRCode`) == `miniatura`) {
                    embed.setDescription(`Se preferir pagar via QR code, basta clicar na imagem ao lado.`)
                    embed.setThumbnail(`attachment://payment.png`)
                } else {
                    embed.setImage('attachment://payment.png')
                }

                pagamentos.set(`${interaction.channel.id}`, { method: 'pix', tipo: `pix` })
                carrinhos.set(`${interaction.channel.id}.pagamentos`, { id: data.id, cp: data.point_of_interaction.transaction_data.qr_code, method: 'pix' })
                pagamentos.set(`${interaction.channel.id}.pagamentos`, { id: data.id, cp: data.point_of_interaction.transaction_data.qr_code, method: 'pix', data: Date.now() })

                await tt.edit({ embeds: [embed], files: [attachment], content: ``, components: [row3] })

                interaction.channel.setName(`💱・${interaction.user.username}・${interaction.user.id}`)


                const mandanopvdocara = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
                    .setTitle(` Pedido solicitado`)
                    .setFooter(
                        { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
                    )
                    .setTimestamp()
                    .setDescription(`Seu pedido foi criado e agora está aguardando a confirmação do pagamento`)
                    .addFields(
                        { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `ID do Pedido`, value: `\`${data.id}\`` },
                        { name: `Forma de Pagamento`, value: ` \`Pix - Mercado Pago\`` }
                    )

                try {
                    await interaction.user.send({ embeds: [mandanopvdocara] })
                } catch (error) {

                }



                const dsfjmsdfjnsdfj = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
                    .setTitle(` Pedido solicitado`)
                    .setDescription(`Usuário ${interaction.user} solicitou um pedido.`)
                    .addFields(
                        { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `ID do Pedido`, value: `\`${data.id}\`` },
                        { name: `**Forma de pagamento**`, value: ` \`Pix - Mercado Pago\`` }
                    )
                    .setFooter(
                        { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
                    )
                    .setTimestamp()

                try {
                    const channela = await client.channels.fetch(configuracao.get(`ConfigChannels.logpedidos`));
                    await channela.send({ embeds: [dsfjmsdfjnsdfj] }).then(yyyyy => {
                        carrinhos.set(`${interaction.channel.id}.replys`, { channelid: yyyyy.channel.id, idmsg: yyyyy.id })
                    })
                } catch (error) {

                }
            }).catch(async function (error) {
                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("pagarpix")
                            .setLabel('Pix')
                            .setEmoji(`1238293609380450304`)
                            .setStyle(2),

                        new ButtonBuilder()
                            .setCustomId("pagarcrypto")
                            .setLabel('Litecoin')
                            .setEmoji(`1256688031088513064`)
                            .setStyle(2)
                            .setDisabled(true)

                    )

                const row4 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("pagarCard")
                        .setLabel(`Cartão de Crédito/Débito`)
                        .setEmoji('1256688008653045831')
                        .setStyle(2)
                        .setDisabled(configuracao.get(`pagamentos.MpSite`) == true ? false : true)

                )

                const row5 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("voltarcarrinho")
                        .setEmoji('1237191329432211468')
                        .setStyle(2)

                )

                tt.edit({ content: `Selecione uma forma de pagamento.`, flags: [4096], components: [row3, row4, row5] })
                interaction.followUp({ content: ` Ocorreu um erro ao criar o pagamento, tente novamente.\nError: ${error}`, flags: [4096] })
            })

    })
}

async function DentroCarrinhoCartao(interaction, client) {

    interaction.deferUpdate()
    await interaction.message.edit({ content: ` Criando seu carrinho...`, flags: [4096], components: [] }).then(async tt => {

        const user = await generateRandomUser();
        const yy = await carrinhos.get(interaction.channel.id)
        const hhhh = produtos.get(`${yy.infos.produto}.Campos`)
        const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo)


        let valor = 0

        if (yy.cupomadicionado !== undefined) {
            const valor2 = gggaaa.valor * yy.quantidadeselecionada

            const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
            const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
            valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
        } else {
            valor = gggaaa.valor * yy.quantidadeselecionada
        }


        const aaaa = Number(valor).toFixed(2)


        var agora = new Date();
        agora.setMinutes(agora.getMinutes() + 10);
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() + 240);
        agora.setHours(agora.getHours() - 5)
        var novaDataFormatada = agora.toISOString().replace('Z', '-04:00');
        let ID = `PzSystem${generateCode(35)}`
        var payment_data = {
            items: [
                {
                    title: `Pagamento - ${interaction.user.username}`,
                    unit_price: Number(aaaa),
                    quantity: 1,
                },
            ],
            external_reference: ID
        }
        if (!mercadopago) {
            throw new Error('Módulo mercadopago não está disponível. Verifique se está instalado corretamente.');
        }
        
        // SDK v2.x do MercadoPago usa uma nova API
        const MP = require("mercadopago");
        const client = new MP.MercadoPagoConfig({ accessToken: configuracao.get('pagamentos.MpAPI') });
        const preference = new MP.Preference(client);
        
        await preference.create({ body: payment_data })
            .then(async function (response) {
                // No SDK v2.x, a resposta vem diretamente, não em .body
                const data = response.body || response;

                const botao = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setURL(data.init_point)
                        .setLabel(`Clique aqui para pagar`)
                        .setEmoji(`1233103068942569543`)
                        .setStyle(5)
                )

                pagamentos.set(`${interaction.channel.id}`, { method: 'site', tipo: `cartão` })
                carrinhos.set(`${interaction.channel.id}.pagamentos`, { id: data.id, cp: data.init_point, method: 'site', PaymentId: ID })
                pagamentos.set(`${interaction.channel.id}.pagamentos`, { id: data.id, cp: data.init_point, method: 'site', data: Date.now(), PaymentId: ID })

                const mandanopvdocara = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
                    .setTitle(` Pedido solicitado`)
                    .setFooter(
                        { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
                    )
                    .setTimestamp()
                    .setDescription(`Seu pedido foi criado e agora está aguardando a confirmação do pagamento`)
                    .addFields(
                        { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `ID do Pedido`, value: `\`${data.id}\`` },
                        { name: `Forma de Pagamento`, value: ` \`Site - Mercado Pago\`` }
                    )

                try {
                    await interaction.user.send({ embeds: [mandanopvdocara] })
                } catch (error) {

                }
                
                const dsfjmsdfjnsdfj = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Processamento`) == null ? `#fcba03` : configuracao.get(`Cores.Processamento`)}`)
                    .setTitle(` Pedido solicitado`)
                    .setDescription(`Usuário ${interaction.user} solicitou um pedido.`)
                    .addFields(
                        { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `ID do Pedido`, value: `\`${data.id}\`` },
                        { name: `**Forma de pagamento**`, value: `\`Site - Mercado Pago\`` }
                    )
                    .setFooter(
                        { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
                    )
                    .setTimestamp()

                try {
                    const channela = await client.channels.fetch(configuracao.get(`ConfigChannels.logpedidos`));
                    await channela.send({ embeds: [dsfjmsdfjnsdfj] }).then(yyyyy => {
                        carrinhos.set(`${interaction.channel.id}.replys`, { channelid: yyyyy.channel.id, idmsg: yyyyy.id })
                    })
                } catch (error) {

                }

                interaction.channel.setName(`💱・${interaction.user.username}・${interaction.user.id}`)
                interaction.message.edit({ content: `Prossiga com seu pagamento. Clique no link abaixo para acessar um ambiente seguro. Após a confirmação, seu pedido será entregue automaticamente. `, components: [botao], embeds: [] })
            }).catch(async function (error) {
                const row3 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("pagarpix")
                        .setLabel('Pix')
                        .setEmoji(`1238293609380450304`)
                        .setStyle(2),
                    new ButtonBuilder()
                        .setCustomId("pagarcrypto")
                        .setLabel('Litecoin')
                        .setEmoji(`1256688031088513064`)
                        .setStyle(2)
                        .setDisabled(true)

                )

                const row4 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("pagarCard")
                        .setLabel(`Cartão de Crédito/Débito`)
                        .setEmoji('1256688008653045831')
                        .setStyle(2)
                        .setDisabled(configuracao.get(`pagamentos.MpSite`) == true ? false : true)

                )

                const row5 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("voltarcarrinho")
                        .setEmoji('1237191329432211468')
                        .setStyle(2)

                )

                tt.edit({ content: `Selecione uma forma de pagamento.`, flags: [4096], components: [row3, row4, row5] })
                interaction.followUp({ content: ` Ocorreu um erro ao criar o pagamento, tente novamente.\nError: ${error}`, flags: [4096] })
            })
    })
}

async function DentroCarrinho2(interaction) {

    const yd = carrinhos.get(interaction.channel.id)

    const hhhh = produtos.get(`${yd.infos.produto}.Campos`)
    const gggaaa = hhhh.find(campo22 => campo22.Nome === yd.infos.campo)


    if (yd.quantidadeselecionada > gggaaa.condicao?.valormaximo) return interaction.reply({ content: ` Você não pode comprar mais de \`${gggaaa.condicao.valormaximo}x ${yd.infos.produto} - ${yd.infos.campo}\``, flags: [4096] })
    if (yd.quantidadeselecionada < gggaaa.condicao?.valorminimo) return interaction.reply({ content: ` Você não pode comprar mais de \`${gggaaa.condicao.valorminimo}x ${yd.infos.produto} - ${yd.infos.campo}\``, flags: [4096] })
    interaction.deferUpdate()


    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("pagarpix")
            .setLabel('Pix')
            .setEmoji(`1238293609380450304`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("pagarcrypto")
            .setLabel('Litecoin')
            .setEmoji(`1256688031088513064`)
            .setStyle(2)
            .setDisabled(true)
    )

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("pagarCard")
            .setLabel(`Cartão de Crédito/Débito`)
            .setEmoji('1256688008653045831')
            .setStyle(2)
            .setDisabled(configuracao.get(`pagamentos.MpSite`) == true ? false : true)

    )

    const row5 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("voltarcarrinho")
            .setEmoji('1237191329432211468')
            .setStyle(2)

    )

    interaction.message.edit({ content: `Selecione uma forma de pagamento.`, components: [row3, row4, row5], embeds: [] })
}

async function DentroCarrinho1(thread, status, client) {

    let ggg
    if (status == 1) {
        ggg = carrinhos.get(thread.channel.id)
    } else {
        ggg = carrinhos.get(thread.id)
    }

    const hhhh = produtos.get(`${ggg.infos.produto}.Campos`)
    const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.infos.campo)
    let yy = await carrinhos.get(`${ggg.threadid}.quantidadeselecionada`)
    if (yy == null) {
        await carrinhos.set(`${ggg.threadid}.quantidadeselecionada`, 1)
        yy = 1
    }

    let user = await client.users.fetch(ggg.user)
    let guild = await client.guilds.fetch(ggg.guild)
    const embed = new EmbedBuilder()
        .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) ? user.displayAvatarURL({ dynamic: true }) : null })
        .setTitle(`Revisão do Pedido`)

        .setFooter(
            { text: guild.name }
        )
        .setTimestamp()

    if (produtos.get(`${ggg.infos.produto}.Config.desc`) !== "Não definido") {
        embed.setDescription(`${produtos.get(`${ggg.infos.produto}.Config.desc`)}`)
    }


    const hhhhsdsadasd2 = produtos.get(`${ggg.infos.produto}.Config`)

    if (hhhhsdsadasd2.banner !== undefined || hhhhsdsadasd2.banner !== '') {
        try {
            await embed.setImage(`${hhhhsdsadasd2.banner}`)
        } catch (error) {

        }

    }
    if (hhhhsdsadasd2.icon !== undefined || hhhhsdsadasd2.icon !== '') {
        try {
            await embed.setThumbnail(`${hhhhsdsadasd2.icon}`)
        } catch (error) {

        }

    }

    if (ggg.cupomadicionado !== undefined) {

        const ggg2 = carrinhos.get(thread.channel.id)
        const hhhh2 = produtos.get(`${ggg.infos.produto}.Cupom`)
        const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === ggg2.cupomadicionado)

        const yyfyfy = gggaaa.valor * yy

        const valorComDesconto = yyfyfy * (1 - gggaaaawdwadwa.desconto / 100);

        const valorOriginalFormatado = Number(yyfyfy).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const valorComDescontoFormatado = Number(valorComDesconto).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


        embed.addFields(
            { name: `**Carrinho**`, value: `\`${yy}x ${ggg.infos.produto} - ${ggg.infos.campo}\``, inline: true },
            {
                name: `**Valor à vista**`,
                value: `De ~~\`R$ ${valorOriginalFormatado}\`~~  por \`${valorComDescontoFormatado}\``,
                inline: true
            },
            { name: `**Cupom**`, value: `\`${ggg2.cupomadicionado}\``, inline: false },
            { name: `**Em estoque**`, value: `\`${gggaaa.estoque.length}\``, inline: false }
        )

    } else {

        embed.addFields(
            { name: `**Valor à vista**`, value: `\`R$ ${Number(gggaaa.valor * yy).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
            { name: `\n    `, value: `\n    `, inline: true },
            { name: `**Em estoque**`, value: `\`${gggaaa.estoque.length}\``, inline: true },
            { name: `**Carrinho**`, value: `\`${yy}x ${ggg.infos.produto} - ${ggg.infos.campo}\``, inline: false }
        )

    }

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("irparapagamento")
                .setLabel('Ir para o Pagamento')
                .setEmoji(`1237192700273365114`)
                .setStyle(3),

            new ButtonBuilder()
                .setCustomId("editarquantidade")
                .setLabel('Editar Quantidade')
                .setEmoji(`1237192698746634331`)
                .setStyle(1)
        )
    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("usarcupom")
                .setLabel('Usar Cupom')
                .setEmoji(`1236447625675407463`)
                .setStyle(2),

            new ButtonBuilder()
                .setCustomId("deletchannel")
                .setLabel('Cancelar')
                .setEmoji(`1246953338541441036`)
                .setStyle(4)
        )

    const admRole = configuracao.get("ConfigRoles.cargoadm")
    const owners = owner.map(rs => `<@${rs}>`).join(', ')

    if (status == 1) {
        thread.deferUpdate()
        thread.message.edit({ content: `${user}, ${admRole !== null ? `<@&${admRole}>` : `${owners}`}`, embeds: [embed], components: [row2, row3] })
    } else {
        thread.send({ content: `${user},  ${admRole !== null ? `<@&${admRole}>` : `${owners}`}`, embeds: [embed], components: [row2, row3] })
    }

}

// function generateRandomEmail(firstName, lastName) {
//     const randomNumber = Math.floor(Math.random() * 1000); // Gera um número aleatório de 0 a 999.
//     const domain = "example.com"; // Domínio fictício, substitua por um domínio apropriado.
//     return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}@${domain}`;
// }

// function generateRandomUser() {
//     const fullName = randomFullName();
//     const cpf = randomCPF();
//     const [firstName, lastName] = fullName.split(' ', 2); // Divide o nome completo em nome e sobrenome.
//     const email = generateRandomEmail(firstName, lastName); // Gera o email com base no nome e sobrenome.

//     return {
//         firstName,
//         lastName,
//         cpf,
//         email
//     };
// }

function generateCode(length) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }

    return code;
}

const faker = require('faker');
const path = require("path");

faker.locale = "pt_BR";

// Dynamic import for ES Module
let generateCPF;
(async () => {
    const cpfModule = await import('gerador-validador-cpf');
    generateCPF = cpfModule.generate;
})();

function generateRandomUser() {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const cpf = generateCPF ? generateCPF() : '000.000.000-00'; // Gera um CPF válido ou fallback
    const email = generateRandomEmail(firstName, lastName);

    return {
        firstName,
        lastName,
        cpf,
        email
    };
}

function generateRandomEmail(firstName, lastName) {
    const randomNumber = Math.floor(Math.random() * 1000);
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const domain = "gmail.com";
    return `${cleanFirstName}.${cleanLastName}${randomNumber}@${domain}`;
}

module.exports = {
    DentroCarrinho1,
    DentroCarrinho2,
    DentroCarrinhoPix,
    DentroCarrinhoCartao,
    DentroCarrinhoEfiBank
}
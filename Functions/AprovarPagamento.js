const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder, ButtonStyle } = require("discord.js")
const { pedidos, carrinhos, produtos, configuracao, estatisticas, entregaslog, Emojis } = require("../DataBaseJson")
const { UpdateMessageProduto } = require("./SenderMessagesOrUpdates")
const { CheckPosition } = require("./PosicoesFunction")
const axios = require('axios');


async function EntregarManual(client, interaction, product, user, quantidade) {

    /// nao vai ter interferencia com o carrinho e so entregar
    let produto = product.split('_')[0]
    let campos = produtos.get(`${produto}.Campos`)
    product = campos.find(campo => campo.Nome === product.split('_')[1])


    let estoque = product?.estoque || [];

    if (estoque.length === 0) {
        return interaction.reply({ content: `O produto **${product.Nome} - ${product.Nome}** está sem estoque.`, ephemeral: true });
    }

    if (estoque.length < quantidade) {
        return interaction.reply({ content: `O produto **${product.Nome} - ${product.Nome}** não possui estoque suficiente.`, ephemeral: true });
    }

    const removedProducts = [];
    const removedIndices = [];
    for (let i = 0; i < quantidade; i++) {
        removedProducts.push(estoque[i]);
        removedIndices.push(i);
    }

    estoque.splice(0, quantidade);

    await produtos.set(`${produto}.Campos`, campos);


    try {
        const fileContent = removedProducts.join('\n');

        const embed = new EmbedBuilder()
            .setColor('#7363ff')
            .setTitle(` Entrega Realizada`)
            .setDescription(`Seu produto foi anexado a essa mensagem.`)
            .addFields(
                { name: 'Detalhes', value: `\`${quantidade}x ${produto} - ${product.Nome}\`\nEntregue por ${interaction.user}` }
            )
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
            .setTimestamp();

        await user.send({ embeds: [embed], files: [{ name: `${product.Nome}.txt`, attachment: Buffer.from(fileContent, 'utf-8'), }], });

        const logChannelId = configuracao.get(`ConfigChannels.logpedidos`);
        const logChannel = (logChannelId && logChannelId !== "null") ? await client.channels.fetch(logChannelId).catch(() => null) : null;

        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle(` Entrega Realizada`)
                .setColor('#7363ff')
                .setDescription(`Usuário ${user} teve seu produto entregue manualmente por ${interaction.user}.`)
                .setFields(
                    { name: `Detalhes`, value: `\`${quantidade}x ${produto} - ${product.Nome}\`\nEntregue por ${interaction.user}` },
                    { name: `User ID`, value: `\`${interaction.user.id}\`` }
                )
                .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
                .setTimestamp();


            await logChannel.send({ embeds: [embed] })
        }

        interaction.update({ content: ` ${user} Teve seu produto entregue! `, embeds: [], components: [], files: [] });
    } catch (error) {
        estoque.splice(0, 0, ...removedProducts);
        await produtos.set(`${produto}.Campos`, campos);
        interaction.update({ content: ` Não foi possível efeutar a entrega, poís o membro possuí a DM fechada, o item foi reposto no estoque.`, components: [], ephemeral: true });
    }
}

async function EntregarPagamentos(client) {

    const yy22 = pedidos.fetchAll()

    for (const entrega of yy22) {
        pedidos.delete(entrega.ID)
        let autoentrega
        const yy = carrinhos.get(entrega.ID)
        let user = await client.users.fetch(yy.user)
        let guild = await client.guilds.fetch(yy.guild)

        if (yy == null) continue

        const yyaa = produtos.get(yy.infos.produto)


        if (yyaa.Config.entrega == 'Sim') {
            autoentrega = true
        } else {
            autoentrega = false
        }

        let valor222 = 0
        const hhhh2121 = produtos.get(`${yy.infos.produto}.Campos`)
        const gggaaaae = hhhh2121.find(campo22 => campo22.Nome === yy.infos.campo)

        if (!await verificarEstoqueEReembolsar(client, yy, entrega, gggaaaae)) {
            continue;
        }

        if (yy.cupomadicionado !== undefined) {
            const valor2 = gggaaaae.valor * yy.quantidadeselecionada

            const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
            const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
            valor222 = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
        } else {
            valor222 = gggaaaae.valor * yy.quantidadeselecionada
        }

        function gerarUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        try {
            const channelaa = await client.channels.fetch(configuracao.get(`ConfigChannels.feedback`));
            if (channelaa) {
                channelaa.send({ content: `<@!${user.id}>` }).then(msg => {
                    setTimeout(async () => {
                        try {
                            await msg.delete();
                        } catch (error) {
                        }
                    }, 5000);
                })
            }
        } catch (error) {

        }


        await estatisticas.set(`${gerarUUID()}`, { produto: yy.infos.produto, campo: yy.infos.campo, quantidade: Number(yy.quantidadeselecionada), valor: Number(valor222), cupomaplicado: yy.cupomadicionado, data: Date.now(), guild: yy.guild.id, userid: yy.user.id, id: entrega.ID, idpagamento: entrega.data.id })

        CheckPosition(client)



        if (autoentrega == true) {



            let valor = 0
            const hhhh = produtos.get(`${yy.infos.produto}.Campos`)
            const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo)


            if (yy.cupomadicionado !== undefined) {
                const valor2 = gggaaa.valor * yy.quantidadeselecionada

                const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
                const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
                valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
            } else {
                valor = gggaaa.valor * yy.quantidadeselecionada
            }


            const removedProducts = [];
            const removedIndices = [];
            for (let i = 0; i < yy.quantidadeselecionada; i++) {
                removedProducts.push(gggaaa.estoque[i]);
                removedIndices.push(i);
            }
            gggaaa.estoque.splice(0, yy.quantidadeselecionada);
            await produtos.set(`${yy.infos.produto}.Campos`, hhhh)
            await UpdateMessageProduto(client, yy.infos.produto)

            if (gggaaa.estoque.length === 0) {
                try {
                const logChannelId = configuracao.get(`ConfigChannels.logpedidos`);
                const logChannel = (logChannelId && logChannelId !== "null") ? await client.channels.fetch(logChannelId).catch(() => null) : null;
                if (logChannel) {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`editestoque_${yy.infos.produto}_${yy.infos.campo}`)
                                    .setLabel('Editar estoque')
                                    .setEmoji(`1187479020040884286`)
                                    .setStyle(1)
                            );

                        await logChannel.send({
                            content: '',
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setAuthor({ name: `Alerta de estoque!`, iconURL: "https://cdn.discordapp.com/emojis/1238303687248576544.webp?size=96&quality=lossless" })
                                    //.setTitle('⚠️ Alerta de Estoque')
                                    .setDescription(`O estoque do produto **${yy.infos.produto} - ${yy.infos.campo}** acabou!`)
                                    .addFields(
                                        { name: 'Produto', value: yy.infos.produto, inline: true },
                                        { name: 'Campo', value: yy.infos.campo, inline: true }
                                    )
                                    .setTimestamp()
                            ],
                            components: [row]
                        });
                    }
                } catch (error) {
                    console.error('Erro ao enviar notificação de estoque zerado:', error);
                }
            }


            const fileContent = removedProducts.join('\n');
            const attachment = new AttachmentBuilder(fileContent, { name: `${entrega.data.id}.txt` }, { type: 'text/plain' });

            const dsfjmsdfjnsdfj2 = new EmbedBuilder()
                .setColor(`${configuracao.get(`Cores.Sucesso`) == null ? `#7464ff` : configuracao.get(`Cores.Sucesso`)}`) //7464ff
                .setTitle(` Entrega Realizada`)
                .setDescription(`Seu produto foi anexado a essa mensagem`)
                .addFields(
                    { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },

                )
                .setFooter(
                    { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null }
                )
                .setTimestamp()


            const row5 = new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(`copiarprodutoentregue`)
                        .setLabel(`Copiar produto entregue`)
                        .setEmoji(`1246953403297435738`)
                        .setStyle(1)
                        .setDisabled(false),

                )

            const row4 = new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(`foraestoquealarme_${yy.infos.produto}_${yy.infos.campo}_1`)
                        .setLabel('Avisar atualizações de estoque')
                        .setEmoji(`1246953429637533848`)
                        .setStyle(2),

                )

            const yyaa = produtos.get(yy.infos.produto)
            const row6 = new ActionRowBuilder();
            if (yyaa && yyaa.mensagens && yyaa.mensagens[0]) {
                const { guildid, channelid, mesageid } = yyaa.mensagens[0];

                const buttonBuilder = new ButtonBuilder()
                    .setURL(`https://discord.com/channels/${guildid}/${channelid}/${mesageid}`)
                    .setLabel('Comprar novamente')
                    .setEmoji(`1246953442283618334`)
                    .setStyle(5);
                row6.addComponents(buttonBuilder);
            }

            try {
                const embedlogpublica = new EmbedBuilder()
                    .setColor(`#62288d`)
                    .setTitle(` Compra Realizada`)
                    .setDescription(`O usuário <@!${user.id}> realizou uma compra no servidor`)
                    .setImage(`https://cdn.discordapp.com/attachments/1274067868123795516/1275584434925469717/Compra_returnsystem.jpg?ex=66d78f94&is=66d63e14&hm=86a713fe447abdf97530f517d7e397f9fbb622c002ddd4bcc0b1cc3c9b2990d2&`)
                    .addFields(
                        { name: `**Carrinho**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo}\`` },
                        { name: `**Valor pago**`, value: `\`R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                    )
                    .setFooter(
                        { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null }
                    )
                    .setTimestamp()

                const row7 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setURL(`https://discord.com/channels/${yyaa.mensagens[0].guildid}/${yyaa.mensagens[0].channelid}/${yyaa.mensagens[0].mesageid}`)
                            .setLabel('Comprar')
                            .setStyle(5),
                    )


                const channelaa = await client.channels.fetch(configuracao.get(`ConfigChannels.eventbuy`));

                if (channelaa) {
                    await channelaa.send({ embeds: [embedlogpublica], components: [row7] })
                }

            } catch (error) {
            }


            try {
                if (gggaaa.roleadd !== undefined) {
                    await client.guilds.cache.get(yy.guild).members.fetch(user.id).then(member => member.roles.add(gggaaa.roleadd)).catch(console.error);
                }
            } catch (error) {
            }
            try {
                if (gggaaa.roleadd !== undefined) {
                    await client.guilds.cache.get(yy.guild).members.fetch(user.id).then(member => member.roles.remove(gggaaa.rolerem)).catch(console.error);
                }
            } catch (error) {

            }

            const member = await client.users.fetch(user.id)
            try {
                if (yy.quantidadeselecionada > 5) {
                    await member.send({
                        files: [{
                            name: `${yy.pagamentos.id}.txt`,
                            attachment: Buffer.from(fileContent, 'utf-8'),
                        }], components: [row5, row4, row6], embeds: [dsfjmsdfjnsdfj2]
                    }).then(async aaaa => {

                        let threadChannel = await client.channels.fetch(entrega.ID);
                        const messages = await threadChannel.messages.fetch({ limit: 100 });
                        await threadChannel.bulkDelete(messages);

                        const umMinutoEmMilissegundos = 2 * 60 * 1000;
                        const timeStamp = Date.now() + umMinutoEmMilissegundos;

                        const row6 = new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setURL(aaaa.url)
                                    .setLabel('Ir para o pedido entregue')
                                    .setStyle(5),
                                new ButtonBuilder()``
                                    .setURL(`https://discord.com/channels/${yyaa.mensagens[0].guildid}/${yyaa.mensagens[0].channelid}/${yyaa.mensagens[0].mesageid}`)
                                    .setLabel('Comprar novamente')
                                    .setEmoji(`1178086986360307732`)
                                    .setStyle(5)
                            )


                        await threadChannel.send({ components: [row6], content: ` **Entrega realizada!** Verifique seu privado, esse ticket será excluído <t:${Math.ceil(timeStamp / 1000)}:R>` }).then(deletemsg => {

                            setInterval(async () => {
                                try {
                                    await threadChannel.delete()
                                } catch (error) {

                                }

                            }, 120000);
                        })



                        threadChannel.setName(`✅・${user.username}・${user.id}`);
                    })
                } else if (yy.quantidadeselecionada <= 5) {
                    const Entrega = configuracao.get(`Emojis_EntregAbaixo`)
                    let msg2 = ``

                    if (Entrega !== null) {
                        Entrega.sort((a, b) => {
                            const numA = parseInt(a.name.replace('eb', ''), 10);
                            const numB = parseInt(b.name.replace('eb', ''), 10);
                            return numA - numB;
                        });

                        Entrega.forEach(element => {
                            msg2 += `<:${element.name}:${element.id}>`
                        });
                    }

                    dsfjmsdfjnsdfj2.setFields(
                        { name: `**Carrinho**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo}\`` },
                        { name: `**Valor pago**`, value: `\`R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `SEU PRODUTO ABAIXO`, value: `${fileContent}` },
                    )


                    await member.send({
                        components: [row5, row4, row6], embeds: [dsfjmsdfjnsdfj2]
                    }).then(async aaaa => {

                        let threadChannel = await client.channels.fetch(entrega.ID);
                        const messages = await threadChannel.messages.fetch({ limit: 100 });
                        await threadChannel.bulkDelete(messages);

                        const umMinutoEmMilissegundos = 2 * 60 * 1000;
                        const timeStamp = Date.now() + umMinutoEmMilissegundos;

                        const row6 = new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setURL(aaaa.url)
                                    .setLabel('Ir para o pedido entregue')
                                    .setStyle(5),
                                new ButtonBuilder()
                                    .setURL(`https://discord.com/channels/${yyaa.mensagens[0].guildid}/${yyaa.mensagens[0].channelid}/${yyaa.mensagens[0].mesageid}`)
                                    .setLabel('Comprar novamente')
                                    .setEmoji(`1178086986360307732`)
                                    .setStyle(5)
                            )


                        await threadChannel.send({ components: [row6], content: ` **Entrega realizada!** Verifique seu privado, esse carrinho será excluído <t:${Math.ceil(timeStamp / 1000)}:R>` }).then(deletemsg => {

                            setInterval(async () => {
                                try {
                                    await threadChannel.delete()
                                } catch (error) {

                                }

                            }, 120000);
                        })



                        threadChannel.setName(`✅・${user.username}・${user.id}`);
                    })
                }


                try {
                    setTimeout(async () => {
                        const dd = configuracao.get(`ConfigChannels.feedback`)
                        const greeting = getGreeting();
                        const week = getWeeklyGreeting();
                        if (dd !== null) {
                            if (configuracao.get(`Instrucoes.mensagem`)) {
                                let instrucoes = configuracao.get(`Instrucoes`)
                                const row6aa = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setURL(instrucoes?.linkbotao ? instrucoes?.linkbotao : `https://discord.com/channels/${yy.guild}/${dd}`)
                                            .setLabel(instrucoes?.nomebotao ? instrucoes?.nomebotao : 'Clique aqui e deixe seu feedback ;)')
                                            .setStyle(5),
                                    )
                                await member.send({ components: [row6aa], content: `${instrucoes.mensagem}` })
                            } else {
                                const row6aa = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setURL(`https://discord.com/channels/${yy.guild}/${dd}`)
                                            .setLabel('Clique aqui e deixe seu feedback ;)')
                                            .setStyle(5),
                                    )
                                await member.send({ components: [row6aa], content: `${greeting} <@!${member.id}>, A experiência foi como esperávamos? Sua opinião é importante, não se esqueça de compartilhá-la. ${week} 😉.` })
                            }
                        }
                    }, 60000);
                } catch (error) {

                }

            } catch (error) {

                let threadChannel = await client.channels.fetch(yy.threadid);
                try {
                    const messages = await threadChannel.messages.fetch({ limit: 100 });
                    await threadChannel.bulkDelete(messages)
                } catch (error) {

                }
                
                const embedddd = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Sucesso`) == null ? `#7464fc` : configuracao.get(`Cores.Sucesso`)}`) //7464fc
                    .setTitle(` Entrega Realizada`)
                    .setDescription(`Seu pedido foi anexado a essa mensagem.`)
                    .setFooter(
                        { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null }
                    )
                    .setTimestamp()
                    .addFields(
                        { name: `Detalhes`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `ID do Pedido`, value: `\`${yy.pagamentos.id}\`` }
                    )



                if (yy.quantidadeselecionada <= 5) {
                    const Entrega = configuracao.get(`Emojis_EntregAbaixo`)
                    let msg2 = ``
                    if (Entrega !== null) {
                        Entrega.sort((a, b) => {
                            const numA = parseInt(a.name.replace('eb', ''), 10);
                            const numB = parseInt(b.name.replace('eb', ''), 10);
                            return numA - numB;
                        });

                        Entrega.forEach(element => {
                            msg2 += `<:${element.name}:${element.id}>`
                        });
                    }
                    embedddd.setFields(
                        { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: `${msg2 !== '' ? msg2 : 'SEU(S) PRODUTO(S) ABAIXO'}`, value: `${fileContent}` },
                    )
                }



                await threadChannel.send({
                    embeds: [embedddd], content: `<@${user.id}> Não foi possível enviar seu pedido na sua DM, então ele foi anexado abaixo, esse carrinho será excluído em breve.`
                })

                if (yy.quantidadeselecionada > 5) {
                    await threadChannel.send({
                        files: [{
                            name: `${yy.pagamentos.id}.txt`,
                            attachment: Buffer.from(fileContent, 'utf-8'),
                        }]
                    })
                }

                threadChannel.setName(`✅・${user.username}・${user.id}`);

                setInterval(async () => {
                    try {
                        await threadChannel.delete()
                    } catch (error) {

                    }

                }, 120000);

            }





            try {
                const lk = carrinhos.get(`${entrega.ID}.replys`)
                const channela = await client.channels.fetch(lk.channelid);
                const yuyu = await channela.messages.fetch(lk.idmsg)
                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`editestoque_${yy.infos.produto}_${yy.infos.campo}`)
                            .setLabel('Editar estoque')
                            .setEmoji(`1187479020040884286`)
                            .setStyle(1),
                    )


                yuyu.reply({
                    files: [{
                        name: `${yy.pagamentos.id}.txt`,
                        attachment: Buffer.from(fileContent, 'utf-8'),
                    }],

                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${configuracao.get(`Cores.Sucesso`) == null ? `#7464fc` : configuracao.get(`Cores.Sucesso`)}`)
                            .setTitle(` Entrega Realizada`)
                            .setDescription(`Usuário <@!${user.id}> teve seu pedido entregue.`)
                            .addFields(
                                { name: `**Detalhes**`, value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                                { name: `ID do Pedido`, value: `\`${yy.pagamentos.id}\`` }
                            )
                            .setFooter(
                                { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null }
                            )
                            .setTimestamp()
                    ], components: [
                        row3
                    ]

                })

            } catch (error) {

            }


        }
        if (autoentrega == false) {


            let valor = 0
            const hhhh = produtos.get(`${yy.infos.produto}.Campos`)
            const gggaaa = hhhh.find(campo22 => campo22.Nome === yy.infos.campo)


            if (yy.cupomadicionado !== undefined) {
                const valor2 = gggaaa.valor * yy.quantidadeselecionada

                const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`)
                const gggaaaawdwadwa = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado)
                valor = valor2 * (1 - gggaaaawdwadwa.desconto / 100);
            } else {
                valor = gggaaa.valor * yy.quantidadeselecionada
            }


            const removedProducts = [];
            const removedIndices = [];
            for (let i = 0; i < yy.quantidadeselecionada; i++) {
                removedProducts.push(gggaaa.estoque[i]);
                removedIndices.push(i);
            }
            gggaaa.estoque.splice(0, yy.quantidadeselecionada);
            await produtos.set(`${yy.infos.produto}.Campos`, hhhh)
            await UpdateMessageProduto(client, yy.infos.produto)

            if (gggaaa.estoque.length === 0) {
                try {
                    const logChannel = await client.channels.fetch(configuracao.get(`ConfigChannels.logpedidos`));
                    if (logChannel) {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`editestoque_${yy.infos.produto}_${yy.infos.campo}`)
                                    .setLabel('Editar estoque')
                                    .setEmoji(`1187479020040884286`)
                                    .setStyle(1)
                            );

                        await logChannel.send({
                            content: '',
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setAuthor({ name: `Alerta de estoque!`, iconURL: "https://cdn.discordapp.com/emojis/1238303687248576544.webp?size=96&quality=lossless" })
                                    //.setTitle('⚠️ Alerta de Estoque')
                                    .setDescription(`O estoque do produto **${yy.infos.produto} - ${yy.infos.campo}** acabou!`)
                                    .addFields(
                                        { name: 'Produto', value: yy.infos.produto, inline: true },
                                        { name: 'Campo', value: yy.infos.campo, inline: true }
                                    )
                                    .setTimestamp()
                            ],
                            components: [row]
                        });
                    }
                } catch (error) {
                    console.error('Erro ao enviar notificação de estoque zerado:', error);
                }
            }


            const fileContent = removedProducts.join('\n');
            const attachment = new AttachmentBuilder(fileContent, { name: `${yy.pagamentos.id}.txt` }, { type: 'text/plain' });


            let threadChannel = await client.channels.fetch(entrega.ID);
            const messages = await threadChannel.messages.fetch({ limit: 100 });
            await threadChannel.bulkDelete(messages);




            const embed = new EmbedBuilder()
                .setAuthor({ name: `${user.username} | Pedido: #${yy.pagamentos.id}` })
                .setTitle(`Informação do pedido.`)
                .setColor(`${configuracao.get(`Cores.Principal`) == null ? `#008000` : configuracao.get(`Cores.Principal`)}`) //008000
                .setFields(
                    { name: 'Detalhes:', value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                    { name: 'Status:', value: `Pagamento confirmado, aguardando entrega` }
                )
                .setFooter(
                    { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null }
                )
                .setTimestamp()

            threadChannel.send({ content: `<@${user.id}> Aguarde a entrega, ela será realizada nesse mesmo canal`, embeds: [embed] })



            threadChannel.setName(`🕔・${user.username}・${user.id}`);


            try {
                const lk = carrinhos.get(`${entrega.ID}.replys`)
                const channela = await client.channels.fetch(lk.channelid);
                const yuyu = await channela.messages.fetch(lk.idmsg)
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${user.username} | Pedido: #${yy.pagamentos.id}` })
                    .setTitle(`Informação do pedido.`)
                    .setColor(`${configuracao.get(`Cores.Principal`) == null ? `#008000` : configuracao.get(`Cores.Principal`)}`)
                    .setFields(
                        { name: 'Detalhes:', value: `\`${yy.quantidadeselecionada}x ${yy.infos.produto} - ${yy.infos.campo} | R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                        { name: 'Status:', value: `Pagamento confirmado, aguardando entrega` },
                        { name: 'Cupom:', value: `Teste`, inline: true },
                        { name: 'UserID:', value: `${user.id}`, inline: true }
                    )
                    .setFooter(
                        { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null }
                    )
                    .setTimestamp()

                yuyu.reply({
                    embeds: [embed], files: [{
                        name: `${yy.pagamentos.id}.txt`,
                        attachment: Buffer.from(fileContent, 'utf-8'),
                    }],
                })
            } catch (error) {

            }

        }





    }




}

function getGreeting() {
    const now = new Date();
    const brtHours = (now.getUTCHours() - 3 + 24) % 24;

    if (brtHours >= 18 || brtHours < 4) {
        return 'Boa noite';
    } else if (brtHours >= 12) {
        return 'Boa tarde';
    } else {
        return 'Bom dia';
    }
}

async function verificarEstoqueEReembolsar(client, yy, entrega, gggaaa) {
    if (gggaaa.estoque.length < yy.quantidadeselecionada) {
        let user = await client.users.fetch(yy.user);
        let guild = await client.guilds.fetch(yy.guild);
        let valorReembolso = 0;
        if (yy.cupomadicionado !== undefined) {
            const valorBase = gggaaa.valor * yy.quantidadeselecionada;
            const hhhh2 = produtos.get(`${yy.infos.produto}.Cupom`);
            const cupom = hhhh2.find(campo22 => campo22.Nome === yy.cupomadicionado);
            valorReembolso = valorBase * (1 - cupom.desconto / 100);
        } else {
            valorReembolso = gggaaa.valor * yy.quantidadeselecionada;
        }

        let bank = "Banco não informado";
        try {
            const res = await axios.get(`https://api.mercadopago.com/v1/payments/${yy.pagamentos.id}`, {
                headers: {
                    'Authorization': `Bearer ${configuracao.get('pagamentos.MpAPI')}`
                }
            });
            bank = res?.data?.point_of_interaction?.transaction_data?.bank_info?.payer?.long_name || "Banco não informado";
        } catch (error) {
            console.error('Erro ao obter informações do banco:', error);
        }

        const embedReembolso = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `Reembolso Necessário | Pedido: #${yy.pagamentos.id}`, iconURL: "https://cdn.discordapp.com/emojis/1260006704691675156.png" })
            .setTitle('Estoque Insuficiente')
            .setDescription(`Infelizmente, o produto "${yy.infos.produto} - ${yy.infos.campo}" não está mais disponível em estoque.`)
            .addFields(
                { name: 'Status', value: `Reembolso Iniciado, aguarde...` },
                { name: 'Valor a ser reembolsado', value: `\`R$ ${Number(valorReembolso).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`` },
                { name: 'Banco', value: `\`${bank}\`` }
            )
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : null })
            .setTimestamp();

        let threadChannel;
        let reembolsoMessage;
        try {
            threadChannel = await client.channels.fetch(entrega.ID);
            const messages = await threadChannel.messages.fetch({ limit: 100 });
            await threadChannel.bulkDelete(messages);
            reembolsoMessage = await threadChannel.send({ content: `<@${user.id}>`, embeds: [embedReembolso] });
            threadChannel.setName(`🔄・Reembolso・${user.id}`);
        } catch (error) {
            console.error('Erro ao enviar mensagem de reembolso:', error);
        }

        try {
            const response = await axios.post(`https://api.mercadopago.com/v1/payments/${yy.pagamentos.id}/refunds`, {}, {
                headers: {
                    'Authorization': `Bearer ${configuracao.get('pagamentos.MpAPI')}`
                }
            });

            if (response.status === 201) {
                console.log(`Reembolso realizado com sucesso para o pedido ${yy.pagamentos.id}`);

                embedReembolso.setColor('Green')
                    .setAuthor({ name: `Reembolso Confirmado! | Pedido: #${yy.pagamentos.id}`, iconURL: "https://cdn.discordapp.com/emojis/1260006725814190150.png" })
                    .setDescription(`O reembolso para o produto(s) foi processado com sucesso.`)
                    .spliceFields(0, 1, { name: 'Status', value: '`Reembolso Concluído`' })
                    .spliceFields(1, 0, { name: 'Produto', value: `\`${yy.infos.produto} - ${yy.infos.campo}\`` });
                try {
                    const user = await client.users.fetch(user.id);
                    await user.send({ embeds: [embedReembolso] });
                    console.log(`Embed de reembolso enviada no privado para o usuário ${user.id}`);
                } catch (dmError) {
                    console.error(`Erro ao enviar DM para o usuário ${user.id}:`, dmError);
                }
            } else {
                console.error(`Erro no reembolso do pedido ${yy.pagamentos.id}:`, response.data);

                embedReembolso.setColor('Orange')
                    .setTitle('Erro no Reembolso')
                    .setDescription(`Ocorreu um erro ao processar o reembolso. Nossa equipe foi notificada e resolverá o problema o mais rápido possível.`)
                    .spliceFields(0, 1, { name: 'Status', value: '`Reembolso Pendente`' });
            }
        } catch (error) {
            console.error('Erro ao processar reembolso:', error);

            embedReembolso.setColor('Red')
                .setTitle('Erro no Reembolso')
                .setDescription(`Ocorreu um erro ao processar o reembolso. Nossa equipe foi notificada e resolverá o problema o mais rápido possível.`)
                .spliceFields(0, 1, { name: 'Status', value: '`Reembolso Pendente`' });
        }

        if (reembolsoMessage) {
            await reembolsoMessage.edit({
                content: `<@${user.id}>`,
                embeds: [embedReembolso],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('delete_disabled')
                            .setLabel(`Carrinho será excluído em 2 minutos`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                ]
            });

            try {
                const logChannel = await client.channels.fetch(configuracao.get(`ConfigChannels.logpedidos`));
                const statusField = embedReembolso.data.fields.find(f => f.name === 'Status');
                const statusValue = statusField ? statusField.value : 'Reembolso Feito!';

                const embedLog = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({ name: `Reembolso Processado | Pedido: #${yy.pagamentos.id}`, iconURL: "https://cdn.discordapp.com/emojis/1260006725814190150.png" })
                    .setTitle('Registro de Reembolso')
                    .setDescription(`Atenção equipe! Um reembolso foi processado devido a estoque insuficiente.`)
                    .addFields(
                        { name: 'Cliente', value: `<@${user.id}>`, inline: true },
                        { name: 'Produto', value: `\`${yy.infos.produto} - ${yy.infos.campo}\``, inline: true },
                        { name: 'Valor Reembolsado', value: `\`R$ ${Number(valorReembolso).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
                        { name: 'Status', value: statusValue, inline: true },
                        { name: 'Banco do Reembolso', value: `\`${bank}\``, inline: true },
                        { name: 'Motivo', value: '`Estoque insuficiente no momento da entrega`', inline: true }
                    )
                    .setFooter({ text: `ID do Usuário: ${user.id}` })
                    .setTimestamp();

                await logChannel.send({ embeds: [embedLog] });
            } catch (logError) {
                console.error('Erro ao enviar log de reembolso:', logError);
            }

            setTimeout(async () => {
                try {
                    await threadChannel.delete();
                    console.log(`Carrinho ${entrega.ID} excluído após reembolso.`);
                } catch (error) {
                    console.error(`Erro ao excluir carrinho ${entrega.ID}:`, error);
                }
            }, 2 * 60 * 1000);
        }

        return false;
    }
    return true;
}

const moment = require('moment-timezone');
function getWeeklyGreeting() {
    const now = moment.tz(new Date(), "America/Sao_Paulo");
    const dayOfWeek = now.day();

    const greeetings = [
        "Tenha um ótimo domingo",
        "Tenha uma ótima segunda-feira",
        "Tenha uma ótima terça-feira",
        "Tenha uma ótima quarta-feira",
        "Tenha uma ótima quinta-feira",
        "Tenha uma ótima sexta-feira",
        "Tenha um ótimo sábado"
    ];

    return greeetings[dayOfWeek];
}


module.exports = {
    EntregarPagamentos,
    EntregarManual
}

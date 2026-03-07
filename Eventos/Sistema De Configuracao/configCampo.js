
const Discord = require("discord.js")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const { produtos, configuracao } = require("../../DataBaseJson");
const { QuickDB } = require("quick.db");
const { GerenciarCampos, GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { UpdateMessageProduto } = require("../../Functions/SenderMessagesOrUpdates");
const { Gerenciar2 } = require("../../Functions/Painel.js");
const db = new QuickDB();


module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.type == Discord.InteractionType.ModalSubmit) {
            if (interaction.customId.startsWith('avisarEstoque_')) {
                let mensagem = interaction.fields.getTextInputValue('mensagem');
                let produto = interaction.customId.split('_')[1];
                let campo = interaction.customId.split('_')[2];

                const hhhh = produtos.get(`${produto}.Campos`);
                const gggaaa = hhhh.find(campo22 => campo22.Nome === campo);
                const users = gggaaa.avisar;

                if (users.length === 0) return interaction.update({ content: `${Emojis.get(`negative_emoji`)} Nenhum usuário para avisar.`, ephemeral: true, components: [] });
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Enviando mensagem de aviso para \`${users.length}\` usuário(s) <t:${Math.floor(Date.now() / 1000) + (3 * users.length)}:R>`, components: [], ephemeral: true });

                let sucess = 0;
                let fail = 0;

                const botaocompra = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${produtos.get(`${produto}`).mensagens[0].channelid}/${produtos.get(`${produto}`).mensagens[0].mesageid}`)
                        .setLabel(`Comprar`)
                        .setStyle(5)
                )

                for (const key in users) {
                    const user = users[key];
                    try {
                        const member = await client.users.fetch(user);
                        mensagem = mensagem.replace(/{user}/g, `${member}`);
                        mensagem = mensagem.replace(/{item}/g, campo);
                        await member.send({ content: mensagem, components: [botaocompra] });
                        sucess++;
                    } catch (error) {
                        fail++;
                        // console.error('Erro ao enviar mensagem:', error);
                    }
                }

                interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} \`${sucess}\` usuário(s) avisado(s) com êxito e \`${fail}\` falhas.`, ephemeral: true, components: [] });
            }
            if (interaction.customId === 'sdaju11111idsjjs123dua123') {
                let a1 = interaction.fields.getTextInputValue('tokenMP');
                let a2 = interaction.fields.getTextInputValue('tokenMP2');
                let a3 = interaction.fields.getTextInputValue('tokenMP3');
                let a4 = interaction.fields.getTextInputValue('tokenMP5');
                let a5 = interaction.fields.getTextInputValue('tokenMP6');
                const regexPadrao = /^#[0-9a-fA-F]{6}$/;

                if (a1 !== '') {
                    if (regexPadrao.test(a1)) {
                        configuracao.set(`Cores.Principal`, a1)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cor \`${a1}\` inválida (Principal).` })
                    }
                }
                if (a2 !== '') {
                    if (regexPadrao.test(a2)) {
                        configuracao.set(`Cores.Processamento`, a2)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cor \`${a2}\` inválida (Processamento).` })
                    }
                }
                if (a3 !== '') {
                    if (regexPadrao.test(a3)) {
                        configuracao.set(`Cores.Sucesso`, a3)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cor \`${a3}\` inválida (Sucesso).` })
                    }
                }
                if (a4 !== '') {
                    if (regexPadrao.test(a4)) {
                        configuracao.set(`Cores.Erro`, a4)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cor \`${a4}\` inválida (Falha).` })
                    }
                }
                if (a5 !== '') {
                    if (regexPadrao.test(a5)) {
                        configuracao.set(`Cores.Finalizado`, a5)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cor \`${a5}\` inválida (Finalizado).` })
                    }
                }

                interaction.reply({ content: `${Emojis.get(`confirmed_emoji`)} Cores atualizadas com sucesso!`, ephemeral: true })


            }


            if (interaction.customId === 'sdaju11111231idsjjs123dua123') {
                let a1 = interaction.fields.getTextInputValue('tokenMP');
                let a2 = interaction.fields.getTextInputValue('tokenMP2');
                let a3 = interaction.fields.getTextInputValue('tokenMP3');
                let a4 = interaction.fields.getTextInputValue('tokenMP5');

                if (a1 !== '') {
                    try {
                        await client.user.setUsername(a1)
                    } catch (error) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Nome inserido \`${a1}\` inválido ou então você alterou mais de 3 vezes o nome em 1 hora!` })
                    }
                }
                if (a2 !== '') {
                    try {
                        await client.user.setAvatar(a2)
                    } catch (error) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Avatar inserido \`${a2}\` inválido.` })
                    }
                }

                if (a3 !== '') {
                    configuracao.set(`Status1`, a3)
                }
                if (a4 !== '') {
                    configuracao.set(`Status2`, a4)
                }

                await interaction.reply({ content: `${Emojis.get(`confirmed_emoji`)} Configurações atualizadas com sucesso!`, ephemeral: true })

            }


            if (interaction.customId === 'dassdadassddsdasddassddasd') {
                let ADD = interaction.fields.getTextInputValue('tokenMP');
                let REM = interaction.fields.getTextInputValue('tokenMP2');


                const ggg = await db.get(interaction.message.id)

                const hhhh = produtos.get(`${ggg.name}.Campos`)
                const gggaaa = hhhh.find(campo => campo.Nome === ggg.camposelect)

                if (ADD !== '') {
                    const ddd = await interaction.guild.roles.fetch(ADD)
                    if (ddd == null) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cargo inserido \`${ADD}\` inválido.` })
                    gggaaa.roleadd = ddd.id
                } else {
                    delete gggaaa.roleadd
                }

                if (REM !== '') {
                    const ddd = await interaction.guild.roles.fetch(REM)
                    if (ddd == null) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cargo inserido \`${REM}\` inválido.` })
                    gggaaa.rolerem = ddd.id
                } else {
                    delete gggaaa.rolerem
                }
                await produtos.set(`${ggg.name}.Campos`, hhhh)

                await GerenciarCampos2(interaction, ggg.camposelect)

                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Alterações realizadas com sucesso!`, ephemeral: true })

            }
            if (interaction.customId === 'configcampoo') {

                const ggg = await db.get(interaction.message.id)
                let nomecampo = interaction.fields.getTextInputValue('tokenMP');
                let preco = interaction.fields.getTextInputValue('tokenMP2');
                let desc = interaction.fields.getTextInputValue('tokenMP3');


                const hhhh = produtos.get(`${ggg.name}.Campos`)


                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.camposelect);

                preco = parseFloat(preco.replace(",", "."));
                if (isNaN(preco)) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Preço inserido \`${preco}\` inválido.` })

                if (ggg.camposelect !== nomecampo) {
                    const produtoExistente = produtos
                        .filter(produto => produto.data.Campos)
                        .some(produto => produto.data.Campos.some(campo => campo.Nome === nomecampo));

                    if (produtoExistente) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Nome do campo já existente.` })
                }


                campoParaAtualizar.valor = preco;
                campoParaAtualizar.Nome = nomecampo;
                campoParaAtualizar.desc = desc;

                await produtos.set(`${ggg.name}.Campos`, hhhh)
                GerenciarCampos2(interaction, nomecampo)
            }
            if (interaction.customId == 'definircondicoes') {

                const ggg = await db.get(interaction.message.id)
                let idcargo = interaction.fields.getTextInputValue('tokenMP');
                let valorminimo = interaction.fields.getTextInputValue('tokenMP2');
                let valormaximo = interaction.fields.getTextInputValue('tokenMP3');

                const hhhh = produtos.get(`${ggg.name}.Campos`)
                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.camposelect);

                if (idcargo !== '') {
                    const ddd = await interaction.guild.roles.fetch(idcargo)
                    if (ddd == null) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Cargo inserido \`${idcargo}\` inválido.` })
                }

                if (valorminimo !== '') {
                    valorminimo = parseInt(valorminimo, 10);
                    if (!Number.isInteger(valorminimo)) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Quantidade inserida \`${valorminimo}\` inválido. Insira apenas números inteiros.` });
                    }
                }

                if (valormaximo !== '') {
                    valormaximo = parseInt(valormaximo, 10);
                    if (!Number.isInteger(valormaximo)) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_emoji`)} Quantidade inserida \`${valormaximo}\` inválido. Insira apenas números inteiros.` });
                    }
                }

                campoParaAtualizar.condicao = {
                    ...(idcargo !== '' ? { idcargo } : {}),
                    ...(valorminimo !== '' ? { valorminimo } : {}),
                    ...(valormaximo !== '' ? { valormaximo } : {}),
                };

                await produtos.set(`${ggg.name}.Campos`, hhhh)

                GerenciarCampos2(interaction, ggg.camposelect)

            }

            if (interaction.customId == 'addestoquemodalaaa') {
                const ggg = await db.get(interaction.message.id)
                let idcargo = interaction.fields.getTextInputValue('tokenMP');



                const linhas = idcargo.split('\n');
                const tresPrimeirasLinhas = linhas.slice(0, 3); // Pegando as três primeiras linhas



                const linhasNumeradas = tresPrimeirasLinhas.map((linha, index) => `${index + 1}・${linha}`);


                const row4 = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId("simestoque")
                            .setLabel('Sim')
                            .setEmoji(`1178076954029731930`)
                            .setStyle(3),

                        new ButtonBuilder()
                            .setCustomId("definirlimitador")
                            .setLabel('Definir delimitador')
                            .setEmoji(`1178317298793205851`)
                            .setStyle(2)
                    )


                interaction.reply({
                    components: [row4],
                    content: `Total de \`${linhas.length}\` itens detectados, cada item será adicionado como um produto no estoque de \`${ggg.camposelect}\`, exemplo:\`\`\`${linhasNumeradas.join('\n')}\`\`\`\nEsse valor será entregue como **uma** unidade para o cliente.\n**Deseja adicionar o valor de \`${linhas.length}\` itens ao estoque de \`${ggg.camposelect}\`?**`,
                    ephemeral: true
                }).then(async msg222 => {
                    await db.set(`${interaction.user.id}.delimitadorStock`, { estoque: idcargo, delimitador: null, produto: ggg.name, campo: ggg.camposelect });
                });



                const hhhh = produtos.get(`${ggg.name}.Campos`)
                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.camposelect);

            }
            if (interaction.customId == 'definirlimitadororrr') {
                const ggg22 = await db.get(`${interaction.user.id}.delimitadorStock`)
                let delimitador = interaction.fields.getTextInputValue('tokenMP');

                var arraysSeparados2222 = ``
                var qtdlinhas = 0
                if (delimitador !== '') {

                    const linhasSeparadas = ggg22.estoque.split(delimitador);
                    const arraysSeparados = linhasSeparadas.map(item => item.trim()).filter(item => item !== '');


                    await db.set(`${interaction.user.id}.delimitadorStock.delimitador`, delimitador);


                    for (let i = arraysSeparados.length - 1; i >= Math.max(0, arraysSeparados.length - 4); i--) {
                        const campooo = arraysSeparados[i];
                        arraysSeparados2222 += `${campooo}\n`;
                    }

                    if (arraysSeparados.length > 4) {
                        arraysSeparados2222 += `E mais ${arraysSeparados.length - 4}...`;
                    }

                    qtdlinhas = arraysSeparados.length
                } else {
                    await db.set(`${interaction.user.id}.delimitadorStock`, { estoque: ggg22.estoque, delimitador: null, produto: ggg22.produto, campo: ggg22.campo });


                    const linhas = ggg22.estoque.split('\n');
                    const primeiraLinha = linhas[0];
                    qtdlinhas = linhas.length
                    arraysSeparados2222 = primeiraLinha
                }

                interaction.update({
                    content: `
                Seu delimitador agora é \`${delimitador == '' ? `Não Definido` : delimitador}\`, cade item será adicionado como um produto no estoque de \`${ggg22.campo}\`, exemplo:\n\`${arraysSeparados2222}\`
                
Esse valor será entregue como **uma** unidade para o cliente.
**Deseja adicionar o valor de \`${qtdlinhas}\`\ itens ao estoque de \`${ggg22.campo}\`?**
                                    `})

            }


            if (interaction.customId == 'sd1213aju11111idsjjsdua') {

                const ggg = await db.get(interaction.message.id)
                let qtd = interaction.fields.getTextInputValue('tokenMP');
                let produto = interaction.fields.getTextInputValue('tokenMP2');

                if (qtd > 100000) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Não foi possível adicionar esse estoque.`, ephemeral: true })

                if (isNaN(qtd)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Esse número não é válido \`${qtd}\`.`, ephemeral: true })

                const arrayItens = [];
                if (produto == '') {
                    for (let i = 0; i < qtd; i++) {
                        const linha = `Item fantasma ${i + 1}/${qtd}`;
                        arrayItens.push(linha);
                    }
                } else {
                    for (let i = 0; i < qtd; i++) {
                        const linha = `${produto} ${i + 1}/${qtd}`;
                        arrayItens.push(linha);
                    }
                }




                await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Aguarde...`, ephemeral: true }).then(async tt => {

                    await tt.edit({ content: `${Emojis.get(`loading_emoji`)} Atualizando estoque...` }).then(async msg => {

                        const hhhh = produtos.get(`${ggg.name}.Campos`)
                        const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)
                        gggaaa.estoque.push(...arrayItens);

                        await produtos.set(`${ggg.name}.Campos`, hhhh)
                        await produtos.set(`${ggg.name}.UltimaReposicao`, Date.now())

                    })

                    await tt.edit({ content: `${Emojis.get(`loading_emoji`)} Sincronizando mensagens...`, ephemeral: true }).then(async msg => {
                        await UpdateMessageProduto(client, ggg.name)

                    })

                    await tt.edit({ content: `${Emojis.get(`confirmed_emoji`)} Total de \`${qtd}\` itens fantasma adicionado ao estoque.`, ephemeral: true })
                })


            }


            if (interaction.customId == 'sdaju11124124111231idsjjs123dua123') {
                const ggg = await db.get(interaction.message.id);
                let qtd = interaction.fields.getTextInputValue('tokenMP');

                if (qtd !== 'sim') return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Confirmação não validada.`, ephemeral: true });

                const hhhh = produtos.get(`${ggg.name}.Campos`);
                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect);

                gggaaa.estoque = [];

                await produtos.set(`${ggg.name}.Campos`, hhhh);

                await GerenciarCampos2(interaction, ggg.camposelect);

                try {
                    const syncMessage = await interaction.followUp({ content: `${Emojis.get(`loading_emoji`)} Sincronizando mensagens...`, ephemeral: true, fetchReply: true });
                    await UpdateMessageProduto(client, ggg.name);

                    interaction.editReply({ message: syncMessage, content: `${Emojis.get(`confirmed_emoji`)} Processo concluído!` })

                } catch (error) {
                    console.error("Error editing message:", error);
                }



            }

        }

        if (interaction.isButton()) {

            if (interaction.customId == 'cleanestoquecampos') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju11124124111231idsjjs123dua123')
                    .setTitle(`Limpar o estoque`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`CONFIRMAÇÃO`)
                    .setPlaceholder(`Digite "sim" para apagar todo estoque.`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)



                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                modalaAA.addComponents(firstActionRow3);
                await interaction.showModal(modalaAA);

            }




            if (interaction.customId == 'estoquefantasma') {


                const modalaAA = new ModalBuilder()
                    .setCustomId('sd1213aju11111idsjjsdua')
                    .setTitle(`Adicionando estoque fantasma`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Quantidade`)
                    .setPlaceholder(`Insira aqui a quantidade de estoque fantasma desejada`)

                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`Valor fantasma (OPCIONAL)`)
                    .setPlaceholder(`Insira aqui um valor fantasma, ex: abra ticket para resgatar`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);


                modalaAA.addComponents(firstActionRow3, firstActionRow4);

                await interaction.showModal(modalaAA);


            }

            const axios = require('axios');

            if (interaction.customId === 'estoquearquivo') {
                const info = await db.get(interaction.message.id);
                let expiracao = Date.now() + 60000;
                await interaction.reply({ content: `${Emojis.get(`question_emoji`)} Envie um ou mais arquivo de texto contendo o estoque que deseja adicionar, <t:${Math.floor(expiracao / 1000)}:R>.`, ephemeral: true }).then((msg) => {
                    const collector = interaction.channel.createMessageCollector({ time: 60000, errors: ['time'] });
                    collector.on('collect', async (message) => {
                        if (message.attachments.size === 0) return;
                        if (message.author.id !== interaction.user.id) return;
                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Aguarde, analisando \`${message.attachments.size}\` arquivo(s)...`, ephemeral: true });
                        let attachments = message.attachments

                        let estoque = [];

                        for (const [key, attachment] of attachments) {
                            await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Carregando arquivos...`, ephemeral: true });

                            const response = await axios({
                                method: "get",
                                url: attachment.url,
                                responseType: "arraybuffer",
                            }).catch((error) => {
                                console.error('Erro ao baixar arquivo:', error);
                                return interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} Erro ao baixar arquivo.`, ephemeral: true });
                            });
                            const buffer = Buffer.from(response.data);
                            const text = buffer.toString('utf-8');
                            const linhas = text.split('\n');
                            estoque.push(...linhas);
                        }
                        message.delete();
                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Arquivo carregado com sucesso, verificando itens...`, ephemeral: true });

                        let existeduplicates = false;
                        let duplicates = [];
                        estoque.forEach((item, index) => {
                            if (estoque.indexOf(item) !== index) {
                                existeduplicates = true;
                                duplicates.push(item);
                            }
                        });

                        if (existeduplicates) {
                            collector.stop();
                            const botao = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('salvarduplicados')
                                    .setLabel('Sim, salvar duplicados')
                                    .setStyle(2),
                                new ButtonBuilder()
                                    .setCustomId('naosalvarduplicados')
                                    .setLabel('Não, ignorar duplicados')
                                    .setStyle(2)
                            );

                            interaction.editReply({ content: `${Emojis.get(`warn_emoji`)} Foram detectados \`${duplicates.length}\` itens duplicados no arquivo, deseja salva-los?`, components: [botao], ephemeral: true }).then((msg) => {
                                const collector = interaction.channel.createMessageComponentCollector({ time: 60000, errors: ['time'] });
                                collector.on('collect', async (button) => {
                                    if (button.user.id !== interaction.user.id) return;
                                    if (button.customId === 'salvarduplicados') {
                                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Salvando itens duplicados...`, components: [], ephemeral: true });

                                        const hhhh = produtos.get(`${info.name}.Campos`);
                                        const campoParaAtualizar = hhhh.find(campo => campo.Nome === info.camposelect);

                                        campoParaAtualizar.estoque.push(...estoque);
                                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Atualizando estoque...`, ephemeral: true });

                                        await produtos.set(`${info.name}.Campos`, hhhh);
                                        await produtos.set(`${info.name}.UltimaReposicao`, Date.now());

                                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Sincronizando mensagens...`, ephemeral: true });

                                        await UpdateMessageProduto(client, info.name);

                                        await interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} Processo finalizado!`, ephemeral: true }).then((msg) => {
                                            collector.stop();
                                        });
                                    } else {
                                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Atualizando estoque...`, components: [], ephemeral: true });

                                        const hhhh = produtos.get(`${info.name}.Campos`);
                                        const campoParaAtualizar = hhhh.find(campo => campo.Nome === info.camposelect);

                                        const estoqueLimpo = estoque.filter((item, index) => estoque.indexOf(item) === index);

                                        campoParaAtualizar.estoque.push(...estoqueLimpo);

                                        await produtos.set(`${info.name}.Campos`, hhhh);
                                        await produtos.set(`${info.name}.UltimaReposicao`, Date.now());

                                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Sincronizando mensagens...`, ephemeral: true });

                                        await UpdateMessageProduto(client, info.name);

                                        await interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} Processo finalizado!`, ephemeral: true }).then((msg) => {
                                            collector.stop();
                                        });
                                    }
                                }).on('end', async (collected, reason) => {
                                    if (reason === 'time') {
                                        return interaction.editReply({ content: `${Emojis.get(`warn_emoji`)} Tempo esgotado. ;)`, ephemeral: true });
                                    }
                                })
                            });
                        } else {
                        await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Sem itens duplicados, atualizando estoque...`, ephemeral: true });
                            const hhhh = produtos.get(`${info.name}.Campos`);
                            const campoParaAtualizar = hhhh.find(campo => campo.Nome === info.camposelect);

                            campoParaAtualizar.estoque.push(...estoque);

                            await produtos.set(`${info.name}.Campos`, hhhh);
                            await produtos.set(`${info.name}.UltimaReposicao`, Date.now());

                            await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Sincronizando mensagens...`, ephemeral: true });

                            await UpdateMessageProduto(client, info.name);

                            await interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} Processo finalizado!`, ephemeral: true }).then((msg) => {
                                collector.stop();
                            });
                        }
                    }).on('end', async (collected, reason) => {
                        if (reason === 'time') {
                            return interaction.editReply({ content: `${Emojis.get(`warn_emoji`)} Tempo esgotado. ;)`, ephemeral: true });
                        }
                    });
                })


            }
            if (interaction.customId == 'cargosremadd') {

                const ggg = await db.get(interaction.message.id);
                const hhhh = produtos.get(`${ggg.name}.Campos`);
                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect);


                const modalaAA = new ModalBuilder()
                    .setCustomId('dassdadassddsdasddassddasd')
                    .setTitle(`Definir cargos`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`CARGO PARA ADICIONAR APÓS COMPRA`)
                    .setPlaceholder(`Insira o id de algum cargo`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(gggaaa.roleadd || '')
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`CARGO PARA REMOVER APÓS COMPRA`)
                    .setPlaceholder(`Insira o id de algum cargo`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(gggaaa.rolerem || '')
                    .setRequired(false)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow52 = new ActionRowBuilder().addComponents(newnameboteN2);



                modalaAA.addComponents(firstActionRow5, firstActionRow52);
                await interaction.showModal(modalaAA);
            }
            if (interaction.customId == 'simestoque') {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Aguarde...`, components: [] })
                let estoque
                const ggg = await db.get(`${interaction.user.id}.delimitadorStock`)
                if (ggg.delimitador !== null) {
                    const linhasSeparadas = ggg.estoque.split(ggg.delimitador);
                    estoque = linhasSeparadas.map(item => item.trim()).filter(item => item !== '');


                } else {
                    estoque = ggg.estoque.split('\n');
                }


                const hhhh = produtos.get(`${ggg.produto}.Campos`)
                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.campo);


                campoParaAtualizar.estoque.push(...estoque);


                await produtos.set(`${ggg.produto}.Campos`, hhhh)
                await produtos.set(`${ggg.produto}.UltimaReposicao`, Date.now())


                await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Atualizando estoque...`, components: [] }).then(async msg => {


                })

                await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Sincronizando mensagens...`, ephemeral: true })
                await UpdateMessageProduto(client, ggg.produto)


                const ggggg = campoParaAtualizar?.avisar;

                const buttonEnabled = ggggg?.length > 0;


                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`avisarestoqueeeee_${ggg?.produto}_${ggg?.campo}_${estoque.length}`)
                            .setLabel(`Avisar ${ggggg?.length || 0} usuário(s) (Com atalho de compra)`)
                            .setEmoji(`1178068047202893869`)
                            .setStyle(2)
                            .setDisabled(!buttonEnabled)
                    );


                await interaction.editReply({
                    components: [row3], content: `${Emojis.get(`confirmed_emoji`)} Estoque de ${ggg.campo} atualizado.`
                })

            }

            if (interaction.customId.startsWith('avisarestoqueeeee')) {

                const regex = /avisarestoqueeeee_(.*?)_(.*)_(.*)/;
                const correspondencias = interaction.customId.match(regex);

                const produto = correspondencias[1];
                const campo = correspondencias[2];
                const qtd = correspondencias[3];
                const hhhh2 = produtos.get(`${produto}`)
                const hhhh = produtos.get(`${produto}.Campos`)
                const gggaaa = hhhh.find(campo22 => campo22.Nome === campo)
                const yy = gggaaa.avisar
                if (yy == 0 || yy == undefined) return interaction.update({ content: `${Emojis.get(`negative_emoji`)} Nenhum usuário para avisar.`, ephemeral: true, components: [] })


                const modal = new ModalBuilder()
                    .setCustomId(`avisarEstoque_${produto}_${campo}`)
                    .setTitle(`Avisar Reabastecimento de Estoque`)

                const mensagem = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`mensagem`)
                        .setLabel(`MENSAGEM`)
                        .setValue(`${getGreeting()} {user}, o estoque de \`{item}\` foi **REABASTECIDO**!`)
                        .setStyle(TextInputStyle.Paragraph)
                )

                modal.addComponents(mensagem)
                await interaction.showModal(modal);

                // yy.forEach(async element => {
                //     try {
                //         const member = await client.users.fetch(element)
                //         const channela = await client.channels.fetch(hhhh2.mensagens[0].channelid);
                //         const greeting = getGreeting();
                //         const week = getWeeklyGreeting();

                //         const row4 = new ActionRowBuilder()
                //             .addComponents(

                //                 new ButtonBuilder()
                //                     .setURL(`https://discord.com/channels/${hhhh2.mensagens[0].guildid}/${hhhh2.mensagens[0].channelid}/${hhhh2.mensagens[0].mesageid}`)
                //                     .setLabel('Comprar Produto')
                //                     .setEmoji(`1178076954029731930`)
                //                     .setStyle(5)
                //             )


                //         await member.send({ components: [row4], content: `# 👋 Reabastecimento!\n- ${greeting} <@${element}>, vim lhe anunciar que graças ao \`${interaction.user.username}\`, o produto \`${gggaaa.Nome}\` teve \`${qtd}\` itens reabastecidos. ${week}!` })
                //     } catch (error) {

                //     }


                // });

                // interaction.update({ content: `${Emojis.get(`confirmed_emoji`)} Avisamos os ${yy.length} que seu produto foi reabastecido com sucesso!`, ephemeral: true, components: [] })

                // gggaaa.avisar = []
                // produtos.set(`${produto}.Campos`, hhhh)
            }
            if (interaction.customId == 'definirlimitador') {
                const ggg = await db.get(`${interaction.user.id}.delimitadorStock`)

                const modalaAA = new ModalBuilder()
                    .setCustomId('definirlimitadororrr')
                    .setTitle(`Definir delimitador personalisado`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`DELIMITADOR`)
                    .setPlaceholder(`Insira o seu delimitador`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                if (ggg.delimitador !== null) {
                    newnameboteN.setValue(`${ggg.delimitador}`)
                }



                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                modalaAA.addComponents(firstActionRow3);
                await interaction.showModal(modalaAA);
            }


            if (interaction.customId == 'addestoque1') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('addestoquemodalaaa')
                    .setTitle(`Adicionando estoque`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Estoque`)
                    .setPlaceholder(`Insira aqui o estoque que deseja adicionar, um abaixo do outro.`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(4000)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);



                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);
            }
            if (interaction.customId == 'estoquedsadas') {
                const ggg = await db.get(interaction.message.id)
                const hhhh = produtos.get(`${ggg.name}.Campos`)

                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)


                if (gggaaa.estoque == 0) {
                    interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O estoque desse item está vazio.`, ephemeral: true })
                } else {


                    const conteudoEstoque = gggaaa.estoque.join('\n');
                    const fileName = `stock_${ggg.camposelect}.txt`;
                    const fileBuffer = Buffer.from(conteudoEstoque, 'utf-8');
                    const greeting = getGreeting();
                    const deletionTimestamp = Math.floor(Date.now() / 1000) + 180;

                    await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Aguarde...`, ephemeral: true });

                    const user = await client.users.fetch(interaction.user.id);

                    user.send({
                        files: [{
                            attachment: fileBuffer,
                            name: fileName
                        }],
                        content: `${greeting} ${user.username}, Segue o estoque atual, total de \`${gggaaa.estoque.length}\` itens. **Apagando mensagem** <t:${deletionTimestamp}:R>**...**`
                    }).then(async message => {
                        await interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} Estoque enviado para o seu privado. A Mensagem será deletada em **3min** por motivos de segurança`, ephemeral: true });

                        setTimeout(() => {
                            message.delete().catch(error => console.error("Falha ao deletar a mensagem privada:", error));
                        }, 180000);

                    }).catch(async error => {
                        console.error("Erro ao enviar mensagem privada:", error);
                        await interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} Não foi possível enviar o estoque no privado. Verifique se tenho permissão para enviar mensagens privadas para você.` });
                    });
                }
            }


            if (interaction.customId == 'addestoquecampos') {


                MessageStock(interaction)
            }

            if (interaction.customId == 'excluirproduto') {
                const ggg = await db.get(interaction.message.id)

                await produtos.delete(`${ggg.name}`)

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                Gerenciar2(interaction, client)
            }


            if (interaction.customId == 'gwdawdwadawawderenciarcampossss') {

                const ggg = await db.get(interaction.message.id)
                const hhhh = produtos.get(`${ggg.name}.Campos`)

                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)


                const modalaAA = new ModalBuilder()
                    .setCustomId('definircondicoes')
                    .setTitle(`Definir condições`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`ID DO CARGO`)
                    .setPlaceholder(`Insira algum id de cargo que será necessário`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`VALOR MÍNIMO DE COMPRA`)
                    .setPlaceholder(`Insira um valor mínimo necessário`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`VALOR MÁXIMO DE COMPRA`)
                    .setPlaceholder(`Insira um valor máximo necessário`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                if (gggaaa.condicao?.idcargo !== undefined) {
                    newnameboteN.setValue(`${gggaaa.condicao.idcargo}`)
                }

                if (gggaaa.condicao?.valorminimo !== undefined) {
                    newnameboteN2.setValue(`${gggaaa.condicao.valorminimo}`)
                }

                if (gggaaa.condicao?.valormaximo !== undefined) {
                    newnameboteN4.setValue(`${gggaaa.condicao.valormaximo}`)
                }


                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);


                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5);
                await interaction.showModal(modalaAA);
            }
            if (interaction.customId == 'editarcampooo') {

                const ggg = await db.get(interaction.message.id)
                const hhhh = produtos.get(`${ggg.name}.Campos`)

                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)

                const modalaAA = new ModalBuilder()
                    .setCustomId('configcampoo')
                    .setTitle(`Editando o campo`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME DO CAMPO`)
                    .setPlaceholder(`Insira o nome desejado`)
                    .setValue(`${gggaaa.Nome}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`PREÇO DO CAMPO`)
                    .setPlaceholder(`Insira um preço desejado (BRL)`)
                    .setValue(`${Number(gggaaa.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`DESCRIÇÃO DO CAMPO (OPCIONAL)`)
                    .setPlaceholder(`Insira um descrição desejada`)
                    .setStyle(TextInputStyle.Paragraph)

                    .setMaxLength(4000)
                    .setRequired(false)



                if (gggaaa.desc !== '') {
                    newnameboteN4.setValue(gggaaa.desc)
                }



                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);





                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5);
                await interaction.showModal(modalaAA);

            }
        }
    }
}


function getGreeting() {
    const now = new Date();
    const brtHours = (now.getUTCHours() - 3 + 24) % 24; // Ajuste de UTC para BRT

    if (brtHours >= 18 || brtHours < 4) {
        return 'Boa noite';
    } else if (brtHours >= 12) {
        return 'Boa tarde';
    } else {
        return 'Bom dia';
    }
}

const moment = require('moment-timezone');
const { Emojis } = require("../../DataBaseJson");
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

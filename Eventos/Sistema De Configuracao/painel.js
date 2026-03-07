const Discord = require("discord.js")
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, StringSelectMenuBuilder, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { Painel, Gerenciar2, definirduvidas } = require("../../Functions/Painel");
const { configqrcode } = require("../../Functions/QRCode.js");
const { AcoesAutomaticsConfigs, LimpezaAutomatica, msgbemvindo, msgbemvindocanais, GerenciarCanais, SistemaNukar, sistemaAntiRaid, SistemadeFiltro, SistemaAntiFake } = require("../../Functions/AcoesAutomatics.js");
const { Gerenciar } = require("../../Functions/Gerenciar");
const { ConfigRoles } = require("../../Functions/ConfigRoles");
const { gerenciarPerms } = require("../../Functions/modUsersPerms");
const { EstatisticasKing } = require("../../index.js");
const { profileuser } = require("../../Functions/profile");
const { extensaoselect,extensaoloja } = require("../../Functions/Extensao.js");
const { produtos, configuracao, tickets,  estatisticas } = require("../../DataBaseJson");
const { Posicao1 } = require("../../Functions/PosicoesFunction.js");
const { painelTicket } = require("../../Functions/PainelTickets.js");
const { CreateMessageTicket, Checkarmensagensticket } = require("../../Functions/CreateMensagemTicket.js");
const { CreateTicket } = require("../../Functions/CreateTicket.js");
const { GerenciarCampos2,GerenciarAdicionais } = require("../../Functions/GerenciarCampos.js");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { AcoesMsgsAutomatics } = require("../../Functions/ConfigMsgsAutomatics.js");
const { AcoesRepostAutomatics } = require("../../Functions/ConfigRepostAuto.js");
const { moedaConfig } = require("../../Functions/moedaConfig.js");
const { protectConfig } = require("../../Functions/protectConfig.js");
const { owner } = require("../../config.json");
const discordTranscripts = require('discord-html-transcripts');
const { StringSelectMenuOptionBuilder } = require("discord.js");
const { Emojis } = require("../../DataBaseJson");
const { UpdateAllMessagesProduct } = require("../../Functions/SenderMessagesOrUpdates.js");

module.exports = {
    name: 'interactionCreate',
    CriarSelectChannel,
    CriarSelectRole,

    run: async (interaction, client) => {

        if (interaction.type == Discord.InteractionType.ModalSubmit) {

            if (interaction.customId == 'botaoduvidas') {
                const emoji = interaction.fields.getTextInputValue('emoji');
                const nomebotao = interaction.fields.getTextInputValue('nomebotao');
                const linkbotao = interaction.fields.getTextInputValue('linkbotao');

                if (emoji !== '') {
                    const emojiRegex = /^<:.+:\d+>$|^<a:.+:\d+>$|^\p{Emoji}$/u;
                    if (!emojiRegex.test(emoji)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o emoji!`, ephemeral: true });
                    }
                    configuracao.set('BotaoDuvidas.emoji', emoji);
                } else {
                    configuracao.delete('BotaoDuvidas.emoji');
                }

                if (nomebotao !== '') {
                    configuracao.set('BotaoDuvidas.nomebotao', nomebotao);
                } else {
                    configuracao.delete('BotaoDuvidas.nomebotao');
                }

                if (linkbotao !== '') {
                    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
                    if (!urlRegex.test(linkbotao)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente a URL do botão!`, ephemeral: true });
                    }
                    configuracao.set('BotaoDuvidas.linkbotao', linkbotao);
                } else {
                    configuracao.delete('BotaoDuvidas.linkbotao');
                }

                await definirduvidas(interaction, client)
                await interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Botão de dúvidas definido com sucesso!`, ephemeral: true });
            }
            if (interaction.customId == 'definirinstrucoes') {
                const mensagem = interaction.fields.getTextInputValue('mensagem');
                const nomebotao = interaction.fields.getTextInputValue('nomebotao');
                const linkbotao = interaction.fields.getTextInputValue('linkbotao');

                if (linkbotao !== '') {
                    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
                    if (!urlRegex.test(linkbotao)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente a URL do botão!`, ephemeral: true });
                    }
                    configuracao.set('Instrucoes.linkbotao', linkbotao);
                } else {
                    configuracao.delete('Instrucoes.linkbotao');
                }
                if (mensagem.length > 1024) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} A mensagem não pode ter mais de 1024 caracteres!`, ephemeral: true });
                }

                if (nomebotao !== '') {
                    configuracao.set('Instrucoes.nomebotao', nomebotao);
                } else {
                    configuracao.delete('Instrucoes.nomebotao');
                }

                if (mensagem !== '') {
                    configuracao.set('Instrucoes.mensagem', mensagem);
                } else {
                    configuracao.delete('Instrucoes.mensagem');
                }

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                await Gerenciar2(interaction, client)
                await interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Instruções definidas com sucesso!`, ephemeral: true });
            }
            if (interaction.customId == 'automaticTempo') {
                const inatividade = interaction.fields.getTextInputValue('inatividade');
                const pospagamento = interaction.fields.getTextInputValue('pospagamento');

                if (isNaN(inatividade) || isNaN(pospagamento)) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O valor deve ser um número!`, ephemeral: true });
                }

                configuracao.set('ConfigCarrinho.inatividade', Number(inatividade));
                configuracao.set('ConfigCarrinho.pospagamento', Number(pospagamento));

                await Gerenciar(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Tempo do carrinho definido com sucesso!`, ephemeral: true });
            }
            if (interaction.customId == 'sdaju11111231idsj1233js123dua123') {
                let NOME = interaction.fields.getTextInputValue('tokenMP');
                let PREDESC = interaction.fields.getTextInputValue('tokenMP2');
                let DESC = interaction.fields.getTextInputValue('tokenMP3');
                let BANNER = interaction.fields.getTextInputValue('tokenMP5');
                let EMOJI = interaction.fields.getTextInputValue('tokenMP6');

                NOME = NOME.replace('.', '');
                PREDESC = PREDESC.replace('.', '');

                if (tickets.get(`tickets.funcoes.${NOME}`) !== null) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Já existe uma função com esse nome!`, ephemeral: true });
                }

                if (NOME.length > 32) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O nome não pode ter mais de 32 caracteres!`, ephemeral: true });
                } else {
                    tickets.set(`tickets.funcoes.${NOME}.nome`, NOME)
                }

                if (PREDESC.length > 64) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} A pré descrição não pode ter mais de 64 caracteres!`, ephemeral: true });
                } else {
                    tickets.set(`tickets.funcoes.${NOME}.predescricao`, PREDESC)
                }

                if (DESC !== '') {
                    if (DESC.length > 1024) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} A descrição não pode ter mais de 1024 caracteres!`, ephemeral: true });
                    } else {
                        tickets.set(`tickets.funcoes.${NOME}.descricao`, DESC)
                    }
                }

                if (BANNER !== '') {
                    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
                    if (!urlRegex.test(BANNER)) {
                        tickets.set(`tickets.funcoes.${NOME}.banner`, BANNER)
                        return interaction.reply({ message: dd, content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente a URL do banner!`, ephemeral: true });
                    } else {
                        tickets.set(`tickets.funcoes.${NOME}.banner`, BANNER)
                    }
                }

                if (EMOJI !== '') {
                    const emojiRegex = /^<:.+:\d+>$|^<a:.+:\d+>$|^\p{Emoji}$/u;
                    if (!emojiRegex.test(EMOJI)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o emoji!`, ephemeral: true });
                    } else {
                        tickets.set(`tickets.funcoes.${NOME}.emoji`, EMOJI)
                    }
                }

                await painelTicket(interaction)

                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Função adicionada com sucesso!`, ephemeral: true });




            }

            if (interaction.customId == '0-89du0awd8awdaw8daw') {

                let TITULO = interaction.fields.getTextInputValue('tokenMP');
                let DESC = interaction.fields.getTextInputValue('tokenMP2');
                let BANNER = interaction.fields.getTextInputValue('tokenMP3');
                let COREMBED = interaction.fields.getTextInputValue('tokenMP5');

                if (TITULO.length > 256) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O título não pode ter mais de 256 caracteres!`, ephemeral: true });
                }
                if (DESC.length > 1024) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} A descrição não pode ter mais de 1024 caracteres!`, ephemeral: true });
                }

                if (COREMBED !== '') {
                    const hexColorRegex = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
                    if (!hexColorRegex.test(COREMBED)) {

                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Código Hex Color \`${COREMBED}\` inváldo, tente pegar [nesse site.](https://www.google.com/search?q=color+picker&oq=color+picker) `, ephemeral: true });
                    } else {
                        tickets.set(`tickets.aparencia.color`, COREMBED)
                    }
                }



                if (BANNER !== '') {
                    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
                    if (!urlRegex.test(BANNER)) {

                        return interaction.reply({ message: dd, content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente a URL do banner!`, ephemeral: true });
                    } else {
                        tickets.set(`tickets.aparencia.banner`, BANNER)
                    }
                }

                if (TITULO !== '') {
                    tickets.set(`tickets.aparencia.title`, TITULO)
                } else {
                    tickets.delete(`tickets.aparencia.title`)
                }

                if (DESC !== '') {
                    tickets.set(`tickets.aparencia.description`, DESC)
                } else {
                    tickets.delete(`tickets.aparencia.description`)
                }

                await painelTicket(interaction)


            }




            if (interaction.customId === 'aslfdjauydvaw769dg7waajnwndjo') {

                let VALOR = interaction.fields.getTextInputValue('tokenMP');
                let CARGO = interaction.fields.getTextInputValue('tokenMP2');


                if (CARGO !== '' && VALOR !== '') {
                    const role = await interaction.guild.roles.fetch(CARGO);

                    if (role === null) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o ID do cargo!`, ephemeral: true });
                    }

                    if (isNaN(VALOR)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o valor!`, ephemeral: true });
                    }

                    configuracao.set(`posicoes.pos1.role`, CARGO);
                    configuracao.set(`posicoes.pos1.valor`, VALOR);
                } else {
                    configuracao.delete(`posicoes.pos1`);
                }

                await Posicao1(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Posição definida com sucesso!`, ephemeral: true });

            }

            if (interaction.customId === 'awiohdbawudwdwhduawdnuaw') {

                let VALOR = interaction.fields.getTextInputValue('tokenMP');
                let CARGO = interaction.fields.getTextInputValue('tokenMP2');


                if (CARGO !== '' && VALOR !== '') {
                    const role = await interaction.guild.roles.fetch(CARGO);

                    if (role === null) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o ID do cargo!`, ephemeral: true });
                    }

                    if (isNaN(VALOR)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o valor!`, ephemeral: true });
                    }

                    configuracao.set(`posicoes.pos2.role`, CARGO);
                    configuracao.set(`posicoes.pos2.valor`, VALOR);
                } else {
                    configuracao.delete(`posicoes.pos2`);
                }

                await Posicao1(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Posição definida com sucesso!`, ephemeral: true });
            }

            if (interaction.customId === 'uy82819171h172') {

                let VALOR = interaction.fields.getTextInputValue('tokenMP');
                let CARGO = interaction.fields.getTextInputValue('tokenMP2');

                if (CARGO !== '' && VALOR !== '') {
                    const role = await interaction.guild.roles.fetch(CARGO);

                    if (role === null) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o ID do cargo!`, ephemeral: true });
                    }

                    if (isNaN(VALOR)) {
                        return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você escolheu incorretamente o valor!`, ephemeral: true });
                    }

                    configuracao.set(`posicoes.pos3.role`, CARGO);
                    configuracao.set(`posicoes.pos3.valor`, VALOR);
                } else {
                    configuracao.delete(`posicoes.pos3`);
                }

                await Posicao1(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Posição definida com sucesso!`, ephemeral: true });
            }


        }

        if (interaction.isAutocomplete()) {
            if (interaction.commandName == 'manage_item') {
                const nomeDigitado = interaction.options.getFocused().toLowerCase();
                const produtosFiltrados = produtos.filter(x => x.ID.toLowerCase().includes(nomeDigitado));
                const produtosSelecionados = produtosFiltrados.slice(0, 25);

                const config = produtosSelecionados.flatMap(x => {
                    const matchingFields = x.data.Campos.filter(iterator =>
                        iterator.Nome.toLowerCase().includes(nomeDigitado)
                    );

                    return matchingFields.map(iterator => ({
                        name: `🧵 ${x.data.Config.name} ➔ ${iterator.Nome}`,
                        value: `${x.ID}_${iterator.Nome}`,
                    }));
                });

                const response = config.length > 0
                    ? config
                    : [{ name: 'Nenhum produto registrado foi encontrado', value: 'nada' }];

                interaction.respond(response);
            }

            if (interaction.commandName == 'manage_stock') {
                const nomeDigitado = interaction.options.getFocused().toLowerCase();
                const produtosFiltrados = produtos.filter(x => x.ID.toLowerCase().includes(nomeDigitado));
                const produtosSelecionados = produtosFiltrados.slice(0, 25);

                const config = produtosSelecionados.flatMap(x => {
                    const matchingFields = x.data.Campos.filter(iterator =>
                        iterator.Nome.toLowerCase().includes(nomeDigitado)
                    );

                    return matchingFields.map(iterator => ({
                        name: `🧵 ${x.data.Config.name} ➔ ${iterator.Nome}`,
                        value: `${x.ID}_${iterator.Nome}`,
                    }));
                });

                const response = config.length > 0
                    ? config
                    : [{ name: 'Nenhum produto registrado foi encontrado', value: 'nada' }];

                interaction.respond(response);
            }
            if (interaction.commandName == 'deliver') {
                const nomeDigitado = interaction.options.getFocused().toLowerCase();
                const produtosFiltrados = produtos.filter(x => x.ID.toLowerCase().includes(nomeDigitado));
                const produtosSelecionados = produtosFiltrados.slice(0, 25);

                const config = produtosSelecionados.flatMap(x => {
                    const matchingFields = x.data.Campos.filter(iterator =>
                        iterator.Nome.toLowerCase().includes(nomeDigitado)
                    );

                    return matchingFields.map(iterator => ({
                        name: `🧵 ${x.data.Config.name} ➔ ${iterator.Nome}`,
                        value: `${x.ID}_${iterator.Nome}`,
                    }));
                });

                const response = config.length > 0
                    ? config
                    : [{ name: 'Nenhum produto registrado foi encontrado', value: 'nada' }];

                interaction.respond(response);
            }

            if (interaction.commandName == 'manage_product') {
                var nomeDigitado = interaction.options.getFocused().toLowerCase();
                var produtosFiltrados = produtos.filter(x => x.ID.toLowerCase().includes(nomeDigitado));
                var produtosSelecionados = produtosFiltrados.slice(0, 25);

                const config = produtosSelecionados.map(x => {
                    return {
                        name: `🧵 ${x.data.Config.name}`,
                        value: `${x.ID}`
                    }
                })

                interaction.respond(!config.length ? [{ name: `Nenhum produto registrado foi encontrado`, value: `nada` }] : config);

            }
        }

        let valorticket
        if (interaction.isButton() && interaction.customId.startsWith('AbrirTicket_')) {
            valorticket = interaction.customId.replace('AbrirTicket_', '');
            CreateTicket(interaction, valorticket)
        } else if (interaction.isStringSelectMenu() && interaction.customId === 'abrirticket') {
            valorticket = interaction.values[0]
            CreateTicket(interaction, valorticket)
        }

        if (interaction.isStringSelectMenu()) {

            if (interaction.customId == 'asdihadbhawhdwhdaw') {


                const campo = interaction.values[0].split('_')[0]
                const produto = interaction.values[0].split('_')[1]


                GerenciarCampos2(interaction, campo, produto, true)

            }

            if (interaction.customId == 'stockhasdhvsudasd') {

                const campo = interaction.values[0].split('_')[0]
                const produto = interaction.values[0].split('_')[1]

                MessageStock(interaction, 1, produto, campo, true)


            }

            if (interaction.customId == 'deletarticketsfunction') {
                const valordelete = interaction.values
                for (const iterator of valordelete) {
                    tickets.delete(`tickets.funcoes.${iterator}`)
                }
                painelTicket(interaction)
            }

        }

        if (interaction.isStringSelectMenu() && interaction.customId == "selectMoedaC") {

            const option = interaction.values[0];

            // if (option === "realBRL") {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                Gerenciar2(interaction, client);
            // } 

        }

        if (interaction.isStringSelectMenu() && interaction.customId == "selectProtectBot") {
            const option = interaction.values[0];
            
            if (option == "permsConfig") {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                gerenciarPerms(interaction, client);
            } else if (option == "sistemaAntiRaid") {
                sistemaAntiRaid(interaction, client);
            }
        }


        if (interaction.isChannelSelectMenu()) {

            if (interaction.customId == 'canalpostarticket') {
                await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Aguarde estamos criando sua mensagem!`, ephemeral: true });
                await CreateMessageTicket(interaction, interaction.values[0], client)
                interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} Mensagem criada com sucesso!`, ephemeral: true });
            }

        }

        if (interaction.isButton()) {

            if (interaction.customId == 'definirduvidas') {
                definirduvidas(interaction, client)
            }
            if (interaction.customId == 'ativarbotaoduvidas') {
                const agora = Date.now();
                const ultimaTroca = configuracao.get('BotaoDuvidas.ultimaTroca') || 0;
                const cooldown = 3600000;

                if (agora - ultimaTroca < cooldown) {
                    return interaction.reply({
                        content: `${Emojis.get('negative_emoji')} Você só poderá alterar o status novamente em ${Math.ceil((cooldown - (agora - ultimaTroca)) / 60000)} minutos.`,
                        ephemeral: true
                    });
                }

                configuracao.set('BotaoDuvidas.ultimaTroca', agora);
                const status = configuracao.get('BotaoDuvidas.status') || false;

                if (status && (!configuracao.get('BotaoDuvidas.nomebotao') || !configuracao.get('BotaoDuvidas.linkbotao'))) {
                    return interaction.reply({
                        content: `${Emojis.get('negative_emoji')} É necessário definir o nome e link do botão.`,
                        ephemeral: true
                    });
                }

                configuracao.set('BotaoDuvidas.status', !status);
                UpdateAllMessagesProduct(client);
                await definirduvidas(interaction, client);
                await interaction.followUp({
                    content: `${Emojis.get('confirmed_emoji')} Status atualizado.\n${Emojis.get(`loading_emoji`)} Mensagens sendo atualizadas...`,
                    ephemeral: true
                });
            }

            if (interaction.customId == 'automaticTempo') {

                const modal = new ModalBuilder()
                    .setCustomId('automaticTempo')
                    .setTitle(`Configurar Tempo do Carrinho`)

                const inatividade = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('inatividade')
                        .setLabel('TEMPO DE INATIVIDADE (MINUTOS)')
                        .setValue(`${configuracao.get('ConfigCarrinho.inatividade') || 5}`)
                        .setStyle(TextInputStyle.Short)
                )

                const pospagamento = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('pospagamento')
                        .setLabel('TEMPO PÓS PAGAMENTO (MINUTOS)')
                        .setValue(`${configuracao.get('ConfigCarrinho.pospagamento') || 5}`)
                        .setStyle(TextInputStyle.Short)
                )

                modal.addComponents(inatividade, pospagamento)
                await interaction.showModal(modal)
            }
            if (interaction.customId == 'sincronizarticket') {
                await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Aguarde estamos atualizando suas mensagem!`, ephemeral: true });
                await Checkarmensagensticket(client)
                interaction.editReply({ content: `${Emojis.get(`confirmed_emoji`)} Mensagens atualizada com sucesso!`, ephemeral: true });
            }



            if (interaction.customId == `postarticket`) {
                const ggg = tickets.get(`tickets.funcoes`)
                const ggg2 = tickets.get(`tickets.aparencia`)


                if (ggg == null || Object.keys(ggg).length == 0 || ggg2 == null || Object.keys(ggg2).length == 0) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Adicione uma função antes de postar a mensagem.`, ephemeral: true });
                } else {
                    const selectaaa = new Discord.ChannelSelectMenuBuilder()
                        .setCustomId('canalpostarticket')
                        .setPlaceholder('Clique aqui para selecionar')
                        .setChannelTypes(Discord.ChannelType.GuildText)

                    const row1 = new ActionRowBuilder()
                        .addComponents(selectaaa);

                    interaction.reply({ components: [row1], content: `Selecione o canal onde quer postar a mensagem.`, ephemeral: true, })

                }
            }

            if (interaction.customId == 'deletar') {
                if (!interaction.member.roles.cache.has(configuracao.get('ConfigRoles.cargoadm')) && !interaction.member.roles.cache.has(configuracao.get('ConfigRoles.cargosup'))) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você não tem permissão para fazer isso!`, ephemeral: true });
                }

                try {
                    const transcript = await discordTranscripts.createTranscript(interaction.channel, {
                        limit: -1,
                        fileName: `transcript-${interaction.channel.name}.html`,
                        saveImages: true,
                        poweredBy: false
                    });

                    const transcriptEmbed = new EmbedBuilder()
                        .setTitle(`📜 Transcript do Ticket: ${interaction.channel.name}`)
                        .setDescription(`O ticket foi encerrado e aqui está o registro completo da conversa.`)
                        .setColor('#0cd4cc')
                        .addFields(
                            { name: 'Ticket Criado Por', value: `<@${interaction.channel.name.split('・')[2]}>`, inline: true },
                            { name: 'Ticket Fechado Por', value: `${interaction.user}`, inline: true },
                            { name: 'Categoria', value: interaction.channel.name.split('・')[0], inline: true }
                        )
                        .setFooter({ text: `${interaction.guild.name} - Sistema de Tickets` })
                        .setTimestamp();

                    const trafficChannel = interaction.guild.channels.cache.get(configuracao.get(`ConfigChannels.systemlogs`));
                    if (trafficChannel) {
                        await trafficChannel.send({
                            //content: `🎭 Um capítulo se encerra, mas a história permanece preservada...`,
                            embeds: [transcriptEmbed],
                            files: [transcript]
                        });
                    }

                    await interaction.reply({ content: `${Emojis.get(`confirmed_emoji`)} O ticket será fechado e um transcript foi salvo.`, ephemeral: true });

                    setTimeout(async () => {
                        await interaction.channel.delete();
                    }, 5000);

                } catch (error) {
                    console.error('Erro ao deletar ticket e enviar transcript:', error);
                    await interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Ocorreu um erro ao processar sua solicitação.`, ephemeral: true });
                }
            }

            if (interaction.customId == 'notifyuser') {
                if (!interaction.member.roles.cache.has(configuracao.get('ConfigRoles.cargoadm')) && !interaction.member.roles.cache.has(configuracao.get('ConfigRoles.cargosup'))) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você não tem permissão para fazer isso!`, ephemeral: true });
                if (!interaction.channel.isThread()) {
                    return interaction.reply({ content: "Este comando só pode ser usado em um tópico de ticket.", ephemeral: true });
                }

                const threadNameParts = interaction.channel.name.split('・');
                const userId = threadNameParts[threadNameParts.length - 1];

                try {
                    const user = await interaction.client.users.fetch(userId);

                    const embed = new Discord.EmbedBuilder()
                        .setColor('#0cd4cc')
                        .setTitle('🎫 Atualização do seu Ticket')
                        .setDescription('Olá! Temos novidades sobre o seu ticket. Estamos aguardando sua resposta!')
                        .addFields(
                            { name: 'Status', value: '📝 Aguardando sua resposta', inline: true },
                            { name: 'Ticket', value: `#${interaction.channel.name.split('・')[0]}`, inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

                    const images = [
                        'https://cdn.discordapp.com/attachments/1267638482843734149/1267638719473647689/Barrinha_ghostsystem.jpg?ex=66a9840e&is=66a8328e&hm=8daa49276fdee98184ad1a2e24b3eb14910caa447438dbbbed55053673ffbeb2&',
                        'https://cdn.discordapp.com/attachments/1267638482843734149/1267638719473647689/Barrinha_ghostsystem.jpg?ex=66a9840e&is=66a8328e&hm=8daa49276fdee98184ad1a2e24b3eb14910caa447438dbbbed55053673ffbeb2&',
                        'https://cdn.discordapp.com/attachments/1267638482843734149/1267638719473647689/Barrinha_ghostsystem.jpg?ex=66a9840e&is=66a8328e&hm=8daa49276fdee98184ad1a2e24b3eb14910caa447438dbbbed55053673ffbeb2&'
                    ];
                    embed.setImage(images[Math.floor(Math.random() * images.length)]);

                    const row = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
                                .setLabel('Ir para o Ticket')
                                .setStyle(Discord.ButtonStyle.Link)
                        );

                    await user.send({ embeds: [embed], components: [row] });

                    await interaction.reply({ content: `${Emojis.get(`confirmed_emoji`)} Notificação enviada com sucesso para ${user.tag}!`, ephemeral: true });

                } catch (error) {
                    console.error("Erro ao notificar o usuário:", error);
                    await interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Ocorreu um erro ao tentar notificar o usuário. Verifique se o usuário ainda está no servidor ou se permite mensagens diretas.`, ephemeral: true });
                }
            }

            const { MessageActionRow, MessageButton } = require('discord.js');

            if (interaction.customId == 'assumerticket') {
                let ticketId = interaction.message.id;
                if (tickets[ticketId] && tickets[ticketId].hasStaffInteracted) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Este ticket já foi atendido.`, ephemeral: true });
                }

                if (!interaction.member.roles.cache.has(configuracao.get('ConfigRoles.cargoadm')) && !interaction.member.roles.cache.has(configuracao.get('ConfigRoles.cargosup'))) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você não tem permissão para assumir este ticket!`, ephemeral: true });
                }

                try {
                    const staffMember = interaction.member;
                    const ultimoIndice = interaction.channel.name.lastIndexOf('・');
                    const ultimosNumeros = interaction.channel.name.slice(ultimoIndice + 1);

                    const owner = await interaction.guild.members.fetch(ultimosNumeros);

                    const confirmationEmbed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${Emojis.get(`_support_emoji`)} Olá <@!${ultimosNumeros}>, Seu Ticket foi Assumido Pelo Staff ${staffMember}.`);

                    const ticketChannel = interaction.guild.channels.cache.get(ticketId);

                    const buttonRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Ir para o Ticket')
                            .setStyle('5')
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}}`)
                    );

                    await owner.send({ embeds: [confirmationEmbed], components: [buttonRow] });

                    const confirmationEmbed222 = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`${Emojis.get(`_support_emoji`)} Olá <@!${ultimosNumeros}>, Seu Ticket foi Assumido Pelo Staff ${staffMember}.`);

                    tickets[ticketId] = { hasStaffInteracted: true, hasPokeStaffBeenClicked: false, staffMemberId: staffMember.id };


                    await interaction.reply({ embeds: [confirmationEmbed222] });
                } catch (error) {
                }
            }

            if (interaction.customId == 'remfuncaoticket') {


                const ggg = tickets.get(`tickets.funcoes`)



                if (ggg == null || Object.keys(ggg).length == 0) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Não existe nenhuma função criada para remover.`, ephemeral: true });
                }

                else {

                    const selectMenuBuilder = new Discord.StringSelectMenuBuilder()
                        .setCustomId('deletarticketsfunction')
                        .setPlaceholder('Clique aqui para selecionar')
                        .setMinValues(0)

                    for (const chave in ggg) {
                        const item = ggg[chave];

                        const option = {
                            label: `${item.nome}`,
                            description: `${item.predescricao}`,
                            value: item.nome
                        };

                        selectMenuBuilder.addOptions(option);


                    }

                    selectMenuBuilder.setMaxValues(Object.keys(ggg).length)

                    const style2row = new ActionRowBuilder().addComponents(selectMenuBuilder);
                    try {
                        await interaction.update({ components: [style2row], content: `${interaction.user} Qual funções deseja remover?`, embeds: [] })
                    } catch (error) {
                    }
                }

            }


            if (interaction.customId == 'rendimento') { //aqui
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("todayyyy")
                            .setLabel('Hoje')
                            .setStyle(2)
                            .setDisabled(false),
                        new ButtonBuilder()
                            .setCustomId("7daysss")
                            .setLabel('Últimos 7 dias')
                            .setStyle(2)
                            .setDisabled(false),
                        new ButtonBuilder()
                            .setCustomId("30dayss")
                            .setLabel('Últimos 30 dias')
                            .setStyle(2)
                            .setDisabled(false),
                        // new ButtonBuilder()
                        //     .setCustomId("twoHours")
                        //     .setLabel('Últimas 2 horas')
                        //     .setStyle(2)
                        //     .setDisabled(false),   
                        // new ButtonBuilder()
                        //     .setCustomId("topProducts")
                        //     .setLabel('Top produtos')
                        //     .setStyle(2)
                        //     .setDisabled(true),   
                        new ButtonBuilder()
                            .setCustomId("totalrendimento")
                            .setLabel('Rendimento Total')
                            .setStyle(3)
                            .setDisabled(false),
                    )
                interaction.reply({ content: `Olá senhor **${interaction.user.username}**, selecione algum filtro.`, components: [row], ephemeral: true })
            }

            if (interaction.customId == 'gerenciarposicao') {

                Posicao1(interaction, client)

            }



            if (interaction.customId == 'Editarprimeiraposição') {

                const aa = configuracao.get(`posicoes`)

                const modalaAA = new ModalBuilder()
                    .setCustomId('aslfdjauydvaw769dg7waajnwndjo')
                    .setTitle(`Definir primeira posição`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`VALOR`)
                    .setPlaceholder(`Insira uma quantia, ex: 100`)
                    .setValue(aa?.pos1?.valor == undefined ? '' : aa.pos1?.valor)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`CARGO`)
                    .setPlaceholder(`Insira um id de algum cargo`)
                    .setValue(aa?.pos1?.role == undefined ? '' : aa.pos1?.role)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);

                modalaAA.addComponents(firstActionRow3, firstActionRow4);

                await interaction.showModal(modalaAA);
            }

            if (interaction.customId == 'Editarsegundaposição') {
                const aa = configuracao.get(`posicoes`)

                const modalaAA = new ModalBuilder()
                    .setCustomId('awiohdbawudwdwhduawdnuaw')
                    .setTitle(`Definir segunda posição`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`VALOR`)
                    .setPlaceholder(`Insira uma quantia, ex: 100`)
                    .setValue(aa?.pos2?.valor == undefined ? '' : aa.pos2?.valor)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`CARGO`)
                    .setPlaceholder(`Insira um id de algum cargo`)
                    .setValue(aa?.pos2?.role == undefined ? '' : aa.pos2?.role)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);

                modalaAA.addComponents(firstActionRow3, firstActionRow4);

                await interaction.showModal(modalaAA);
            }

            if (interaction.customId == 'Editarterceiraposição') {
                const aa = configuracao.get(`posicoes`)
                const modalaAA = new ModalBuilder()
                    .setCustomId('uy82819171h172')
                    .setTitle(`Definir terceira posição`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`VALOR`)
                    .setPlaceholder(`Insira uma quantia, ex: 100`)
                    .setValue(aa?.pos3?.valor == undefined ? '' : aa.pos3?.valor)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`CARGO`)
                    .setPlaceholder(`Insira um id de algum cargo`)
                    .setValue(aa?.pos3?.role == undefined ? '' : aa.pos3?.role)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);

                modalaAA.addComponents(firstActionRow3, firstActionRow4);

                await interaction.showModal(modalaAA);
            }
            if (interaction.customId == 'todayyyy' || interaction.customId == '7daysss' || interaction.customId == '30dayss' || interaction.customId == 'totalrendimento' || interaction.customId == 'twoHours') {
                let rendimento;
                let name;
                let embed;

                if (interaction.customId == 'todayyyy') {
                    rendimento = await EstatisticasKing.SalesToday();
                    name = 'Resumo das vendas de hoje';
                } else if (interaction.customId == '7daysss') {
                    rendimento = await EstatisticasKing.SalesWeek();
                    name = 'Resumo das vendas nos últimos 7 dias';
                } else if (interaction.customId == '30dayss') {
                    rendimento = await EstatisticasKing.SalesMonth();
                    name = 'Resumo das vendas nos últimos 30 dias';
                } else if (interaction.customId == 'totalrendimento') {
                    rendimento = await EstatisticasKing.SalesTotal();
                    name = 'Resumo geral de todas as vendas';
                } else if (interaction.customId == 'twoHours') {
                    rendimento = await EstatisticasKing.SalesLastTwoHours();
                    name = 'Resumo das vendas das últimas 2 horas';
                    embed = new EmbedBuilder()
                        .setColor(`${configuracao.get(`Cores.Principal`) == null ? `#00FF00` : configuracao.get(`Cores.Principal`)}`)
                        .setTitle(`${name}`)
                        .addFields(
                            { name: `**Rendimento**`, value: `\`R$ ${Number(rendimento.rendimentoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
                            { name: `**Pedidos aprovados**`, value: `\`${rendimento.quantidadeTotal}\``, inline: true },
                            { name: `**Produtos entregues**`, value: `\`${rendimento.produtosEntregue}\``, inline: true },
                            { name: `**Usuários únicos**`, value: `\`${rendimento.usuarios.length}\``, inline: true }
                        )
                        .setAuthor({ name: `${interaction.user.username}` })
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.username}` });

                    interaction.update({ content: ``, embeds: [embed] });
                    return;
                }

                embed = new EmbedBuilder()
                    .setColor(`${configuracao.get(`Cores.Principal`) == null ? `#00FF00` : configuracao.get(`Cores.Principal`)}`)
                    .setTitle(`${name}`)
                    .addFields(
                        { name: `**Rendimento**`, value: `\`R$ ${Number(rendimento.rendimentoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
                        { name: `**Pedidos aprovados**`, value: `\`${rendimento.quantidadeTotal}\``, inline: true },
                        { name: `**Produtos entregues**`, value: `\`${rendimento.produtosEntregue}\``, inline: true },
                    )
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` ? interaction.user.displayAvatarURL({ dynamic: true }) : null })
                    .setTimestamp()
                    .setFooter({ text: `${interaction.user.username}` });

                interaction.update({ content: ``, embeds: [embed] });
            }

            if (interaction.customId.startsWith('criarrrr')) {

                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju11111idsjjsdua')
                    .setTitle(`Criação`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME`)
                    .setPlaceholder(`Insira o nome do seu produto`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`DESCRIÇÃO`)
                    .setPlaceholder(`Insira uma descrição para seu produto`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setMaxLength(1024)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`ENTREGA AUTOMÁTICA?`)
                    .setPlaceholder(`Digite "sim" ou "não"`)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(3)
                    .setRequired(true)

                const newnameboteN5 = new TextInputBuilder()
                    .setCustomId('tokenMP4')
                    .setLabel(`ICONE (OPCIONAL)`)
                    .setPlaceholder(`Insira uma URL de uma imagem ou gif`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN6 = new TextInputBuilder()
                    .setCustomId('tokenMP5')
                    .setLabel(`BANNER (OPCIONAL)`)
                    .setPlaceholder(`Insira uma URL de uma imagem ou gif`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN5);
                const firstActionRow7 = new ActionRowBuilder().addComponents(newnameboteN6);



                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6, firstActionRow7);
                await interaction.showModal(modalaAA);

            }

            if (interaction.customId.startsWith('voltar1')) {

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                Painel(interaction, client)

            }

            if (interaction.customId.startsWith('voltarMsgsConfig')) { //exemplo

                AcoesAutomaticsConfigs(interaction, client)

            }


            if (interaction.customId.startsWith('addfuncaoticket')) {

                const dd = tickets.get('tickets.funcoes')


                if (dd && Object.keys(dd).length > 24) {
                    return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Você não pode criar mais de 24 funções em seu TICKET!` });
                }

                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju11111231idsj1233js123dua123')
                    .setTitle(`Adicionar função`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME DA FUNÇÃO`)
                    .setPlaceholder(`Insira aqui um nome, como: Suporte`)
                    .setStyle(TextInputStyle.Short)

                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`PRÉ DESCRIÇÃO`)
                    .setPlaceholder(`Insira aqui uma pré descrição, ex: "Preciso de suporte."`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(99)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`DESCRIÇÃO`)
                    .setPlaceholder(`Insira aqui a descrição da função.`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setMaxLength(99)

                const newnameboteN5 = new TextInputBuilder()
                    .setCustomId('tokenMP5')
                    .setLabel(`BANNER (OPCIONAL)`)
                    .setPlaceholder(`Insira aqui uma URL de uma imagem ou GIF`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN6 = new TextInputBuilder()
                    .setCustomId('tokenMP6')
                    .setLabel(`EMOJI DA FUNÇÃO`)
                    .setPlaceholder(`Insira um nome ou id de um emoji do servidor.`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN5);
                const firstActionRow7 = new ActionRowBuilder().addComponents(newnameboteN6);


                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6, firstActionRow7);
                await interaction.showModal(modalaAA);

            }
            if (interaction.customId.startsWith('definiraparencia')) {



                const modalaAA = new ModalBuilder()
                    .setCustomId('0-89du0awd8awdaw8daw')
                    .setTitle(`Editar Ticket`);

                const dd = tickets.get(`tickets.aparencia`)

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`TITULO`)
                    .setPlaceholder(`Insira aqui um nome, como: Entrar em contato`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(dd?.title == undefined ? '' : dd.title)
                    .setRequired(true)


                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`DESCRIÇÃO`)
                    .setPlaceholder(`Insira aqui uma descrição.`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(dd?.description == undefined ? '' : dd.description)
                    .setMaxLength(500)
                    .setRequired(true)


                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`BANNER (OPCIONAL)`)
                    .setPlaceholder(`Insira aqui uma URL de uma imagem ou GIF`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(dd?.banner == undefined ? '' : dd.banner)
                    .setRequired(false)



                const newnameboteN5 = new TextInputBuilder()
                    .setCustomId('tokenMP5')
                    .setLabel(`COR DO EMBED (OPCIONAL)`)
                    .setPlaceholder(`Insira aqui um código Hex Color, ex: FFFFFF`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(dd?.color == undefined ? '' : dd.color)
                    .setRequired(false)


                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN5);

                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6);
                await interaction.showModal(modalaAA);



            }

            if (interaction.customId.startsWith('painelconfigticket')) {


                painelTicket(interaction)


            }



            if (interaction.customId.startsWith('personalizarbot')) {

                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju11111231idsjjs123dua123')
                    .setTitle(`Editar perfil do bot`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME DE USUÁRIO`)
                    .setValue(`${client.user.username}`)
                    .setPlaceholder(`Insira um nome de usuário (só pode mudar 3x por hora)`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`AVATAR`)
                    .setPlaceholder(`Insira uma URL de um ícone`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`STATUS 1`)
                    .setPlaceholder(`Insira aqui um status personalizado`)
                    .setValue(`COLOCA AQUI O STATUS 1`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN5 = new TextInputBuilder()
                    .setCustomId('tokenMP5')
                    .setLabel(`STATUS 2`)
                    .setValue(`COLOCA AQUI O STATUS 2`)
                    .setPlaceholder(`Insira aqui um status personalizado`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN5);

                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6);
                await interaction.showModal(modalaAA);

            }


            if (interaction.customId.startsWith('coresembeds')) {

                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju11111idsjjs123dua123')
                    .setTitle(`Editar cores dos embeds`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`COR PRINCIPAL`)
                    .setPlaceholder(`Insira aqui um código Hex Color, ex: #Obd4cd`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`COR DE PROCESSAMENTO`)
                    .setPlaceholder(`Insira aqui um código Hex Color, ex: #fcba03`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`COR DE SUCESSO`)
                    .setPlaceholder(`Insira aqui um código Hex Color, ex: #39fc03`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN5 = new TextInputBuilder()
                    .setCustomId('tokenMP5')
                    .setLabel(`COR DE FALHA`)
                    .setPlaceholder(`Insira aqui um código Hex Color, ex: #ff0000`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN6 = new TextInputBuilder()
                    .setCustomId('tokenMP6')
                    .setLabel(`COR DE FINALIZADO`)
                    .setPlaceholder(`Insira aqui um código Hex Color, ex: #7363ff`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN5);
                const firstActionRow7 = new ActionRowBuilder().addComponents(newnameboteN6);



                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6, firstActionRow7);
                await interaction.showModal(modalaAA);

            }



            if (interaction.customId.startsWith('voltar2')) {

                Gerenciar(interaction, client)

            }

            if (interaction.customId == "altMoeda") {

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] });

                moedaConfig(interaction, client);

            }

            if (interaction.customId == "protecaoBot") {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] });
                protectConfig(interaction, client);
            }
            if (interaction.customId.startsWith('gerenciarconfigs')) {
                Gerenciar(interaction, client)
            }
            if (interaction.customId.startsWith('configcargos')) {
                ConfigRoles(interaction, client)
            }
            if (interaction.customId.startsWith('painelpersonalizar')) {


                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("coresembeds")
                            .setLabel('Editar cores dos embeds')
                            .setEmoji(`1178080366871973958`)
                            .setStyle(1),

                        new ButtonBuilder()
                            .setCustomId("personalizarbot")
                            .setLabel('Personalizar Bot')
                            .setEmoji(`1178080828933283960`)
                            .setStyle(1),

                        new ButtonBuilder()
                            .setCustomId("definirtema")
                            .setLabel('Definir tema')
                            .setEmoji(`1178066208835252266`)
                            .setDisabled(true)
                            .setStyle(1)
                    )

                const row3 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel('Voltar')
                        .setEmoji(`1238413255886639104`)
                        .setStyle(2),
                )

                interaction.update({ embeds: [], components: [row2, row3], content: `Escolha uma opção e use sua criatividade e profissionalismo ;) ` })


            }
            if (interaction.customId.startsWith('painelconfigbv')) {
                msgbemvindo(interaction, client)
            }
            if (interaction.customId === 'voltar_msgbemvindo') {
                msgbemvindo(interaction, client)
            }
            if (interaction.customId === 'canaisboasvindas') {
                msgbemvindocanais(interaction, client)
            }
            if (interaction.customId === 'voltar_msgbemvindocanais') {
                msgbemvindocanais(interaction, client)
            }
            if (interaction.customId === 'voltar_AcoesAutomaticsConfigs') {
                AcoesAutomaticsConfigs(interaction, client)
            }
            if (interaction.customId.startsWith('marca-qrcode')) {
                configqrcode(interaction, client)
            }

            if (interaction.customId.startsWith('actionsautomations')) { //exemplo
                AcoesAutomaticsConfigs(interaction, client)
            }
            if (interaction.customId.startsWith('ecloudpanel')) { 
                ecloudpanelconfig(interaction, client)
            }
            if (interaction.customId.startsWith('MsgsAutoConfig')) { //exemplo
                AcoesMsgsAutomatics(interaction, client)
            }
            if (interaction.customId.startsWith('lojadeextensao')) { //exemplo
                extensaoloja(interaction, client)
            }
            if (interaction.customId.startsWith('extensoes')) { //exemplo
                extensaoselect(interaction, client)
            }
            if (interaction.customId.startsWith('recuppanelks')) { 
                restaurarpanel(interaction, client)
}
if (interaction.customId.startsWith('acoesecloud')) { // Botão Tools
    configurarOauth2testedesgraca(interaction, client)
}
            if (interaction.customId.startsWith('automaticRepostar')) { //exemplo
                AcoesRepostAutomatics(interaction, client)
            }
            if (interaction.customId.startsWith('taxados')) { //exemplo
                taxadost(interaction, client)
            }
            if (interaction.customId.startsWith('voltar3')) {

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                Gerenciar2(interaction, client)

            }

            if (interaction.customId.startsWith('voltar00')) {

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                Painel(interaction, client)

            }


            if (interaction.customId.startsWith('painelconfigvendas')) {

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                Gerenciar2(interaction, client)

            }
            if (interaction.customId.startsWith('voltarsendlogo')) {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                Gerenciar2(interaction, client)
            }
            if (interaction.customId == "botaoduvidas") {

                const modal = new ModalBuilder()
                    .setCustomId('botaoduvidas')
                    .setTitle('Botão de Dúvidas')


                const nomebotao = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('nomebotao')
                        .setLabel('Nome Para o Botão (Opcional)')
                        .setPlaceholder('Insira aqui um nome, ex: Abrir Ticket')
                        .setRequired(true)
                        .setValue(configuracao.get('BotaoDuvidas.nomebotao') || '')
                        .setStyle(TextInputStyle.Paragraph)
                )

                const linkbotao = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('linkbotao')
                        .setLabel('Link Para o Botão')
                        .setPlaceholder('Insira aqui um link, ex: https://discord.gg/invite')
                        .setRequired(true)
                        .setValue(configuracao.get('BotaoDuvidas.linkbotao') || '')
                        .setStyle(TextInputStyle.Paragraph)
                )

                const emoji = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('emoji')
                        .setLabel('Emoji Para o Botão (Opcional)')
                        .setPlaceholder('Insira aqui um emoji, ex: 🎫')
                        .setRequired(false)
                        .setValue(configuracao.get('BotaoDuvidas.emoji') || '')
                        .setStyle(TextInputStyle.Paragraph)
                )


                modal.addComponents(nomebotao, linkbotao, emoji)
                await interaction.showModal(modal)
            }
            if (interaction.customId == "definirinstrucoes") {

                const modal = new ModalBuilder()
                    .setCustomId('definirinstrucoes')
                    .setTitle('Definindo instruções')

                const mensagem = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('mensagem')
                        .setLabel('Mensagem Após a Entrega')
                        .setPlaceholder('Insira aqui um conteúdo, ex: Se teve algum problema com o item entregue, por favor, abra um ticket.')
                        .setRequired(false)
                        .setValue(configuracao.get('Instrucoes.mensagem') || '')
                        .setStyle(TextInputStyle.Paragraph)
                )

                const nomebotao = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('nomebotao')
                        .setLabel('Nome Para o Botão (Opcional)')
                        .setPlaceholder('Insira aqui um nome, ex: Abrir Ticket')
                        .setRequired(false)
                        .setValue(configuracao.get('Instrucoes.nomebotao') || '')
                        .setStyle(TextInputStyle.Paragraph)
                )

                const linkbotao = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('linkbotao')
                        .setLabel('Link Para o Botão (Opcional)')
                        .setPlaceholder('Insira aqui um link, ex: https://discord.gg/invite')
                        .setRequired(false)
                        .setValue(configuracao.get('Instrucoes.linkbotao') || '')
                        .setStyle(TextInputStyle.Paragraph)
                )

                modal.addComponents(mensagem, nomebotao, linkbotao)
                await interaction.showModal(modal)
            }
            if (interaction.customId == "qrcode-pisicao") {

                const selectmenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`qrcode-posicao`)
                        .setPlaceholder('Selecione uma posição')
                        .setMaxValues(1)
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Miniatura do Embed`)
                                .setDescription(`O QR code ficará na miniatura do embed no checkout.`)
                                .setValue('miniatura'),
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Imagem do Embed`)
                                .setDescription(`O QR code ficará na imagem do embed no checkout.`)
                                .setValue('imagem'),
                        )
                )

                await interaction.update({ content: ``, embeds: [], components: [selectmenu] })
            }
            if (interaction.customId == "voltarProtect") {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                protectConfig(interaction, client);
            }
            if (interaction.customId == "addcanalboasvindas") {
                const maxChannels = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;

                const botao = CriarSelectChannel(client, interaction, 'addcanalboasvindas', 'Selecione um canal para adicionar', interaction?.guild?.channels?.cache?.filter(channel => channel.type === ChannelType.GuildText).size || 1);

                await interaction.update({ content: `Selecione um canal para adicionar`, embeds: [], components: botao })
            }
            if (interaction.customId == "removercanalboasvindas") {

                const canais = configuracao.get(`Entradas.canais`) || [];

                if (canais.length == 0) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Não há canais adicionados.`, ephemeral: true });

                let select = new StringSelectMenuBuilder()
                    .setCustomId('removercanalboasvindas')
                    .setPlaceholder('Selecione um canal para remover')
                    .setMinValues(0)
                    .setMaxValues(canais.length)

                for (const canal of canais) {
                    let canalObj;
                    try {
                        const fetchedChannel = await interaction.guild.channels.fetch(canal);
                        canalObj = { label: fetchedChannel.name, value: fetchedChannel.id };
                    } catch (error) {
                        canalObj = { label: `${canal} (Canal deletado)`, value: canal };
                    }

                    if (canalObj) {
                        select.addOptions(canalObj);
                    }
                }

                select = new ActionRowBuilder().addComponents(select);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('voltar_msgbemvindocanais')
                        .setLabel('Voltar')
                        .setEmoji('1178068047202893869')
                        .setStyle(2)
                )

                await interaction.update({ content: `Selecione um canal para remover`, embeds: [], components: [select, row] });
            }
            if (interaction.customId.startsWith('voltarfunctioncanais_')) {
                let nomeFunction = interaction.customId.split('_')[1];
                const funcoes = require('../../Functions/AcoesAutomatics.js');

                try {
                    if (typeof funcoes[nomeFunction] === 'function') {
                        await funcoes[nomeFunction](interaction, client);
                    } else {
                        console.log(`Função ${nomeFunction} não encontrada.`);
                    }
                } catch (error) {
                    console.error(`Erro ao chamar a função ${nomeFunction}:`, error);
                }
            }
            if (interaction.customId.startsWith('adicionarcanal_')) {
                const customId = interaction.customId.split('_')[1];
                let opcoes = await CriarSelectChannel(client, interaction, customId, 'Selecione um canal para adicionar', interaction?.guild?.channels?.cache?.filter(channel => channel.type === ChannelType.GuildText).size >= 25 ? 25 : interaction?.guild?.channels?.cache?.filter(channel => channel.type === ChannelType.GuildText).size);
                interaction.update({ content: `Selecione canais para adicionar`, embeds: [], components: opcoes });
            }
            if (interaction.customId.startsWith('adicionarcargos_')) {
                const customId = interaction.customId.split('_')[1];
                let opcoes = await CriarSelectRole(client, interaction, customId, 'Selecione um canal para adicionar', 1);
                interaction.update({ content: `Selecione cargos para adicionar`, embeds: [], components: opcoes });
            }
            if (interaction.customId.startsWith('removercargos_')) {
                const customId = interaction.customId.split('_')[1];
                let cargos = configuracao.get(`AutomaticSettings.${customId}.cargos`) || [];

                if (cargos.length == 0) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Não há cargos adicionados.`, ephemeral: true });

                let select = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`removercargos_${customId}`)
                        .setPlaceholder('Selecione um cargo para remover')
                        .setMinValues(0)
                        .setMaxValues(cargos.length)
                )

                cargos.forEach(cargo => {
                    const cargoObj = interaction.guild.roles.cache.get(cargo);
                    if (!cargoObj) {
                        select.components[0].addOptions({
                            label: `${cargo} (Cargo deletado)`,
                            value: cargo
                        });
                        return;
                    }

                    select.components[0].addOptions({
                        label: cargoObj.name,
                        value: cargoObj.id
                    });
                })

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`voltarfunctioncargos_${customId}`)
                        .setLabel('Voltar')
                        .setEmoji('1178068047202893869')
                        .setStyle(2)
                )


                interaction.update({ content: `Selecione um cargo para remover`, embeds: [], components: [select, row] });
            }
            if (interaction.customId.startsWith('removercanal_')) {
                const customId = interaction.customId.split('_')[1];
                let canais = configuracao.get(`AutomaticSettings.${customId}.canais`) || [];

                if (canais.length == 0) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Não há canais adicionados.`, ephemeral: true });

                let select = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`removercanal_${customId}`)
                        .setPlaceholder('Selecione um canal para remover')
                        .setMinValues(0)
                        .setMaxValues(canais.length)
                )

                canais.forEach(canal => {
                    const canalObj = interaction.guild.channels.cache.get(canal);
                    if (!canalObj) {
                        select.components[0].addOptions({
                            label: `${canal} (Canal deletado)`,
                            value: canal
                        });
                        return;
                    }

                    select.components[0].addOptions({
                        label: canalObj.name,
                        value: canalObj.id
                    });
                });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`voltarfunctioncanais_${customId}`)
                        .setLabel('Voltar')
                        .setEmoji('1178068047202893869')
                        .setStyle(2)
                )

                interaction.update({ content: `Selecione um canal para remover`, embeds: [], components: [select, row] });
            }
            if (interaction.customId === 'automaticLimpeza') {
                LimpezaAutomatica(interaction, client)
            }
            if (interaction.customId === 'automaticOpenClose') {
                GerenciarCanais(interaction, client)
            }
            if (interaction.customId === 'automaticNukar') {
                SistemaNukar(interaction, client)
            }
            if (interaction.customId === 'painelantifake') {
                SistemaAntiFake(interaction, client)
            }
            if (interaction.customId === 'automaticAntiraid') {
                sistemaAntiRaid(interaction, client)
            }
            if (interaction.customId === 'sistemadefiltro') {
                SistemadeFiltro(interaction, client)
            }
            if (interaction.customId === 'configuracaoexcecao') {
                const modal = new ModalBuilder()
                    .setCustomId('configuracaoexcecao')
                    .setTitle(`Definir Exceções`)

                let cargos = configuracao.get(`AutomaticSettings.SistemadeFiltro.cargos`) || []
                let categoria = configuracao.get(`AutomaticSettings.SistemadeFiltro.categoria`) || []
                let stringcargos = ''
                let stringcategoria = ''

                try {
                    for (const cargo of cargos) {
                        const fetchedRole = await interaction.guild.roles.fetch(cargo);
                        stringcargos += `${fetchedRole.id}, `

                    }
                } catch (error) {

                }
                stringcargos = stringcargos.slice(0, -2);

                try {

                    for (const cat of categoria) {
                        const fetchedCat = await interaction.guild.channels.fetch(cat);
                        stringcategoria += `${fetchedCat.id}, `
                    }
                } catch (error) {
                }

                stringcategoria = stringcategoria.slice(0, -2);
                const cargosImunes = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`cargos`)
                        .setLabel(`CARGOS IMUNES`)
                        .setPlaceholder(`cargo1, cargo2, cargo3`)
                        .setValue(stringcargos)
                        .setStyle(1)
                        .setRequired(false)
                )

                const categoriaImunes = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`categoria`)
                        .setLabel(`CATEGORIA IMUNE`)
                        .setPlaceholder(`categoria1, categoria2, categoria3`)
                        .setValue(stringcategoria)
                        .setStyle(1)
                        .setRequired(false)
                )

                modal.addComponents(cargosImunes, categoriaImunes)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'configurarFiltro') {
                const modal = new ModalBuilder()
                    .setCustomId('configurarFiltro')
                    .setTitle(`Definir Filtro`)

                const status = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`status`)
                        .setLabel(`DEFINA O STATUS DO SISTEMA`)
                        .setValue(configuracao.get(`AutomaticSettings.SistemadeFiltro.status`) ? 'on' : 'off')
                        .setMaxLength(3)
                        .setRequired(true)
                        .setStyle(1)
                )

                const punicao = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`punicao`)
                        .setLabel(`DEFINA A PUNIÇÃO`)
                        .setPlaceholder('BAN, KICK, MUTE, REMOVER PUNICAO')
                        .setValue(configuracao.get(`AutomaticSettings.SistemadeFiltro.punicao`) || 'Sem Punição')
                        .setRequired(true)
                        .setStyle(1)
                )

                const ms = require('ms');
                let valuetempo = configuracao.get(`AutomaticSettings.SistemadeFiltro.tempo`) != 'permanente' && configuracao.get(`AutomaticSettings.SistemadeFiltro.tempo`) != undefined ? `${ms(configuracao.get(`AutomaticSettings.SistemadeFiltro.tempo`))}` : configuracao.get(`AutomaticSettings.SistemadeFiltro.tempo`) == `permanente` ? 'permanente' : ''
                const tempo = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`tempo`)
                        .setLabel(`DEFINA O TEMPO`)
                        .setPlaceholder('PERMANENTE, 1d, 1h, 1m, 1s')
                        .setValue(valuetempo)
                        .setRequired(true)
                        .setStyle(1)
                )

                modal.addComponents(status, punicao, tempo)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'adicionarFiltro') {

                const modal = new ModalBuilder()
                    .setCustomId('adicionarFiltro')
                    .setTitle(`Adicionar Filtro`)

                const convites = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`convites`)
                        .setLabel(`DESEJA FILTRAR CONVITES?`)
                        .setPlaceholder(`Sim ou Não`)
                        .setValue(configuracao.get(`AutomaticSettings.SistemadeFiltro.convites`) ? 'sim' : 'não')
                        .setRequired(false)
                        .setStyle(1)
                )
                let stringlinks = ''
                let links2 = configuracao.get(`AutomaticSettings.SistemadeFiltro.links`) || []
                let palavrastring = ''
                let palavras2 = configuracao.get(`AutomaticSettings.SistemadeFiltro.palavras`) || []

                for (const link of links2) {
                    stringlinks += `${link}\n`
                }

                for (const palavra of palavras2) {
                    palavrastring += `${palavra}\n`
                }

                const links = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`links`)
                        .setLabel(`INSIRA OS LINKS QUE DESEJA FILTRAR`)
                        .setPlaceholder(`https://discord.com\nhttps://youtube.com`)
                        .setRequired(false)
                        .setValue(stringlinks)
                        .setStyle(2)
                )

                const palavras = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`palavras`)
                        .setLabel(`INSIRA AS PALAVRAS QUE DESEJA FILTRAR`)
                        .setPlaceholder(`palavra1\npalavra2\npalavra3`)
                        .setValue(palavrastring)
                        .setRequired(false)
                        .setStyle(2)
                )

                modal.addComponents(convites, links, palavras)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'configurarLimpeza') {
                const modal = new ModalBuilder()
                    .setCustomId('configurarLimpeza')
                    .setTitle(`Limpeza Automática`)

                const status = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`status`)
                        .setLabel(`DEFINA O STATUS DO SISTEMA`)
                        .setValue(configuracao.get(`AutomaticSettings.LimpezaAutomatica.status`) ? 'on' : 'off')
                        .setMaxLength(3)
                        .setRequired(true)
                        .setStyle(1)
                )
                const primeira = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`primeira`)
                        .setLabel(`DEFINA O PRIMEIRO HORÁRIO`)
                        .setValue(configuracao.get(`AutomaticSettings.LimpezaAutomatica.primeira`) || '')
                        .setRequired(true)
                        .setStyle(1)
                )
                const segunda = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`segunda`)
                        .setLabel(`DEFINA O SEGUNDO HORÁRIO`)
                        .setValue(configuracao.get(`AutomaticSettings.LimpezaAutomatica.segunda`) || '')
                        .setRequired(true)
                        .setStyle(1)
                )

                modal.addComponents(status, primeira, segunda)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'configurarCanais') {
                const modal = new ModalBuilder()
                    .setCustomId('configurarCanais')
                    .setTitle(`Gerenciar Canais`)

                const status = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`status`)
                        .setLabel(`DEFINA O STATUS DO SISTEMA`)
                        .setValue(configuracao.get(`AutomaticSettings.GerenciarCanais.status`) ? 'on' : 'off')
                        .setMaxLength(3)
                        .setRequired(true)
                        .setStyle(1)
                )
                const primeira = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`abertura`)
                        .setLabel(`DEFINA O HORÁRIO DE ABERTURA`)
                        .setValue(configuracao.get(`AutomaticSettings.GerenciarCanais.abertura`) || '')
                        .setRequired(true)
                        .setStyle(1)
                )
                const segunda = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`fechamento`)
                        .setLabel(`DEFINA O HORÁRIO DE FECHAMENTO`)
                        .setValue(configuracao.get(`AutomaticSettings.GerenciarCanais.fechamento`) || '')
                        .setRequired(true)
                        .setStyle(1)
                )

                modal.addComponents(status, primeira, segunda)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'configurarNukar') {
                const modal = new ModalBuilder()
                    .setCustomId('configurarNukar')
                    .setTitle(`Sistema Nukar`)

                const status = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`status`)
                        .setLabel(`DEFINA O STATUS DO SISTEMA`)
                        .setValue(configuracao.get(`AutomaticSettings.SistemaNukar.status`) ? 'on' : 'off')
                        .setMaxLength(3)
                        .setRequired(true)
                        .setStyle(1)
                )

                const horario = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`horario`)
                        .setLabel(`DEFINA O HORÁRIO`)
                        .setValue(configuracao.get(`AutomaticSettings.SistemaNukar.horario`) || '')
                        .setRequired(true)
                        .setStyle(1)
                )

                modal.addComponents(status, horario)
                await interaction.showModal(modal)
            }
        }
        if (InteractionType.ModalSubmit === interaction.type) {
            if (interaction.customId === 'adicionarFiltro') {
                let links = interaction.fields.getTextInputValue('links').split('\n').map(link => link.trim()).filter(link => link !== '');
                let palavras = interaction.fields.getTextInputValue('palavras').split('\n').map(palavra => palavra.trim()).filter(palavra => palavra !== '');
                let convites = interaction.fields.getTextInputValue('convites').toLowerCase();

                if (convites !== 'sim' && convites !== 'não' && convites !== 'nao') return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O valor de convites deve ser "sim" ou "não"`, ephemeral: true });
                convites = convites === 'sim';
                configuracao.set('AutomaticSettings.SistemadeFiltro.convites', convites);

                if (links.length > 0) {
                    configuracao.set('AutomaticSettings.SistemadeFiltro.links', links);
                } else {
                    configuracao.set('AutomaticSettings.SistemadeFiltro.links', []);
                }
                if (palavras.length > 0) {
                    configuracao.set('AutomaticSettings.SistemadeFiltro.palavras', palavras);
                } else {
                    configuracao.set('AutomaticSettings.SistemadeFiltro.palavras', []);
                }

                await SistemadeFiltro(interaction, client);
                await interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Configurações salvas com sucesso!`, ephemeral: true });
            }

            if (interaction.customId === 'configuracaoexcecao') {
                const cargos = interaction.fields.getTextInputValue('cargos').split(',').map(cargo => cargo.trim());
                const categoria = interaction.fields.getTextInputValue('categoria').split(',').map(cat => cat.trim());

                const cargosID = [];
                const categoriaID = [];

                for (const cargo of cargos) {
                    const fetchedRole = interaction.guild.roles.cache.get(cargo);

                    if (fetchedRole && fetchedRole.id) {
                        cargosID.push(fetchedRole.id);
                    } else {
                    }
                }

                for (const cat of categoria) {
                    const fetchedCat = interaction.guild.channels.cache.get(cat);

                    if (fetchedCat && fetchedCat.type === ChannelType.GuildCategory) {
                        categoriaID.push(fetchedCat.id);
                    } else {
                    }
                }

                configuracao.set(`AutomaticSettings.SistemadeFiltro.cargos`, cargosID);
                configuracao.set(`AutomaticSettings.SistemadeFiltro.categoria`, categoriaID);

                await SistemadeFiltro(interaction, client);
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Configurações salvas com sucesso!`, ephemeral: true });
            }


            if (interaction.customId === 'configurarFiltro') {
                const status = interaction.fields.getTextInputValue('status').toLowerCase()
                let punicao = interaction.fields.getTextInputValue('punicao').toLowerCase()
                const tempo = interaction.fields.getTextInputValue('tempo').toLowerCase()

                if (status != 'on' && status != 'off') return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O status deve ser "on" ou "off"`, ephemeral: true });
                if (punicao != 'ban' && punicao != 'kick' && punicao != 'mute') {
                    punicao = undefined;
                }
                if (!tempo.match(/^(permanente|([0-9]+[smhd]))$/)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O tempo deve ser "permanente" ou um valor seguido de "s", "m", "h" ou "d"`, ephemeral: true });
                const ms = require('ms');
                configuracao.set(`AutomaticSettings.SistemadeFiltro.status`, status == 'on' ? true : false);
                if (punicao) {
                    configuracao.set(`AutomaticSettings.SistemadeFiltro.punicao`, punicao);
                } else {
                    configuracao.delete(`AutomaticSettings.SistemadeFiltro.punicao`);
                }
                configuracao.set(`AutomaticSettings.SistemadeFiltro.tempo`, tempo == 'permanente' ? 'permanente' : ms(tempo));

                await SistemadeFiltro(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Configurações salvas com sucesso!`, ephemeral: true });
            }
            if (interaction.customId === 'configurarNukar') {
                let status = interaction.fields.getTextInputValue('status').toLowerCase()
                let horario = interaction.fields.getTextInputValue('horario')

                if (status != 'on' && status != 'off') return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O status deve ser "on" ou "off"`, ephemeral: true });
                status = status == 'on' ? true : false;

                if (!horario.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O horário deve ser no formato HH:MM`, ephemeral: true });

                configuracao.set(`AutomaticSettings.SistemaNukar.status`, status);
                configuracao.set(`AutomaticSettings.SistemaNukar.horario`, horario);

                await SistemaNukar(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Configurações salvas com sucesso!`, ephemeral: true });
            }
            if (interaction.customId === 'configurarLimpeza') {
                let status = interaction.fields.getTextInputValue('status').toLowerCase()
                let primeira = interaction.fields.getTextInputValue('primeira')
                let segunda = interaction.fields.getTextInputValue('segunda')

                if (status != 'on' && status != 'off') return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O status deve ser "on" ou "off"`, ephemeral: true });
                status = status == 'on' ? true : false;

                if (!primeira.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O horário deve ser no formato HH:MM`, ephemeral: true });
                if (!segunda.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O horário deve ser no formato HH:MM`, ephemeral: true });
                if (primeira === segunda) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Os horários não podem ser iguais`, ephemeral: true });
                configuracao.set(`AutomaticSettings.LimpezaAutomatica.status`, status);
                configuracao.set(`AutomaticSettings.LimpezaAutomatica.primeira`, primeira);
                configuracao.set(`AutomaticSettings.LimpezaAutomatica.segunda`, segunda);

                await LimpezaAutomatica(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Configurações salvas com sucesso!`, ephemeral: true });
            }
            if (interaction.customId === 'configurarCanais') {
                let status = interaction.fields.getTextInputValue('status').toLowerCase()
                let abertura = interaction.fields.getTextInputValue('abertura')
                let fechamento = interaction.fields.getTextInputValue('fechamento')

                if (status != 'on' && status != 'off') return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O status deve ser "on" ou "off"`, ephemeral: true });
                status = status == 'on' ? true : false;

                if (!abertura.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O horário deve ser no formato HH:MM`, ephemeral: true });
                if (!fechamento.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} O horário deve ser no formato HH:MM`, ephemeral: true });
                if (abertura === fechamento) return interaction.reply({ content: `${Emojis.get(`negative_emoji`)} Os horários não podem ser iguais`, ephemeral: true });
                configuracao.set(`AutomaticSettings.GerenciarCanais.status`, status);
                configuracao.set(`AutomaticSettings.GerenciarCanais.abertura`, abertura);
                configuracao.set(`AutomaticSettings.GerenciarCanais.fechamento`, fechamento);

                await GerenciarCanais(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Configurações salvas com sucesso!`, ephemeral: true });
            }
        }
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'qrcode-posicao') {
                let posicao = interaction.values[0];
                configuracao.set(`pagamentos.QRCode`, posicao);
                await configqrcode(interaction, client);
                await interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Posição do QR Code alterada.`, ephemeral: true });
            }
            if (interaction.customId === 'select_AcoesAutomaticsConfigs') {
                const customId = interaction.values[0];
                if (customId === 'automaticRepostar') {
                    AcoesRepostAutomatics(interaction, client)
                    return
                }
                if (customId === 'MsgsAutoConfig') {
                    AcoesMsgsAutomatics(interaction, client)
                    return
                }

if(interaction.customId === "gerenciar_adicionais") {
    const dados = await db.get(interaction.message.id);
    return GerenciarAdicionais(interaction, dados.name, dados.camposelect);
}


                const funcoes = require('../../Functions/AcoesAutomatics.js');
                if (typeof funcoes[customId] === 'function') {
                    await funcoes[customId](interaction, client);
                } else {
                    console.log(`Função ${customId} não encontrada.`);
                }
            }
            if (interaction.customId.startsWith('removercanal_')) {
                const customId = interaction.customId.split('_')[1];
                let canais = configuracao.get(`AutomaticSettings.${customId}.canais`) || [];
                let novosCanais = canais.filter(canal => !interaction.values.includes(canal));

                configuracao.set(`AutomaticSettings.${customId}.canais`, novosCanais);

                const funcoes = require('../../Functions/AcoesAutomatics.js');
                if (typeof funcoes[customId] === 'function') {
                    await funcoes[customId](interaction, client);
                }
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} \`${interaction.values.length}\` canais removidos com sucesso!`, ephemeral: true });
            }
            if (interaction.customId.startsWith('removercargos_')) {
                const customId = interaction.customId.split('_')[1];
                let canais = configuracao.get(`AutomaticSettings.${customId}.cargos`) || [];
                let novosCanais = canais.filter(canal => !interaction.values.includes(canal));

                configuracao.set(`AutomaticSettings.${customId}.cargos`, novosCanais);

                const funcoes = require('../../Functions/AcoesAutomatics.js');
                if (typeof funcoes[customId] === 'function') {
                    await funcoes[customId](interaction, client);
                }
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} \`${interaction.values.length}\` cargos removidos com sucesso!`, ephemeral: true });
            }
            if (interaction.customId.startsWith('removercanal_')) {
                const customId = interaction.customId.split('_')[1];
                let canais = configuracao.get(`AutomaticSettings.${customId}.canais`) || [];
                let novosCanais = canais.filter(canal => !interaction.values.includes(canal));

                configuracao.set(`AutomaticSettings.${customId}.canais`, novosCanais);

                const funcoes = require('../../Functions/AcoesAutomatics.js');
                if (typeof funcoes[customId] === 'function') {
                    await funcoes[customId](interaction, client);
                }
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} \`${interaction.values.length}\` canais removidos com sucesso!`, ephemeral: true });
            }
            if (interaction.customId === 'removercanalboasvindas') {
                let canais = configuracao.get(`Entradas.canais`) || [];
                let novosCanais = canais.filter(canal => !interaction.values.includes(canal));

                configuracao.set(`Entradas.canais`, novosCanais);

                await msgbemvindo(interaction, client);
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} Canal removido com sucesso!`, ephemeral: true });
            }
        }
        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId.startsWith('selectchannel_')) {
                let nomeFunction = interaction.customId.split('_')[1]

                if (nomeFunction === 'msgbemvindocanais') {
                    let canais = configuracao.get(`Entradas.canais`) || [];
                    let selecionados = interaction.values

                    if (canais.length > 0) {
                        selecionados = selecionados.filter(canal => !canais.includes(canal));
                    }
                    if (selecionados.length == 0) {
                        await msgbemvindo(interaction, client);
                        return interaction.followUp({ content: `${Emojis.get(`negative_emoji`)} Nenhum canal novo foi adicionado.`, ephemeral: true });
                    }

                    canais.push(...selecionados);

                    configuracao.set(`Entradas.canais`, canais);

                    await msgbemvindo(interaction, client);
                    interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} \`${selecionados.length}\` novo canais adicionado com sucesso!`, ephemeral: true });
                } else {
                    let canais = configuracao.get(`AutomaticSettings.${nomeFunction}.canais`) || [];
                    let funcoes = require('../../Functions/AcoesAutomatics.js');
                    let selecionados = interaction.values

                    if (canais.length > 0) {
                        selecionados = selecionados.filter(canal => !canais.includes(canal));
                    }

                    if (selecionados.length == 0) {
                        if (typeof funcoes[nomeFunction] === 'function') {
                            await funcoes[nomeFunction](interaction, client);
                        } else {
                            console.log(`Função ${nomeFunction} não encontrada.`);
                        }
                        return interaction.followUp({ content: `${Emojis.get(`negative_emoji`)} Nenhum canal novo foi adicionado.`, ephemeral: true });
                    }
                    canais.push(...selecionados);
                    configuracao.set(`AutomaticSettings.${nomeFunction}.canais`, canais);
                    if (typeof funcoes[nomeFunction] === 'function') {
                        await funcoes[nomeFunction](interaction, client);
                    }
                    interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} \`${selecionados.length}\` novo canais adicionado com sucesso!`, ephemeral: true });
                }
            }

        }
        if (interaction.isRoleSelectMenu()) {
            if (interaction.customId.startsWith('selectrole_')) {
                let nomeFunction = interaction.customId.split('_')[1]
                let cargos = configuracao.get(`AutomaticSettings.${nomeFunction}.canais`) || [];
                let funcoes = require('../../Functions/AcoesAutomatics.js');
                let selecionados = interaction.values

                if (cargos.length > 0) {
                    selecionados = selecionados.filter(canal => !cargos.includes(canal));
                }

                if (selecionados.length == 0) {
                    if (typeof funcoes[nomeFunction] === 'function') {
                        await funcoes[nomeFunction](interaction, client);
                    } else {
                        console.log(`Função ${nomeFunction} não encontrada.`);
                    }
                    return interaction.followUp({ content: `${Emojis.get(`negative_emoji`)} Nenhum canal novo foi adicionado.`, ephemeral: true });
                }
                cargos.push(...selecionados);
                configuracao.set(`AutomaticSettings.${nomeFunction}.cargos`, cargos);
                if (typeof funcoes[nomeFunction] === 'function') {
                    await funcoes[nomeFunction](interaction, client);
                }
                interaction.followUp({ content: `${Emojis.get(`confirmed_emoji`)} \`${selecionados.length}\` novo cargos adicionado com sucesso!`, ephemeral: true });
            }
        }
    }
}

async function CriarSelectChannel(client, interaction, customId, Placeholder, maxChannels) {

    const botao = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
            .setCustomId(`selectchannel_${customId}`)
            .setMaxValues(maxChannels)
            .setPlaceholder(Placeholder)
            .setChannelTypes(ChannelType.GuildText)
    )

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltarfunctioncanais_${customId}`)
            .setLabel('Voltar')
            .setEmoji('1178068047202893869')
            .setStyle(2)
    )

    return [botao, row]
}
async function CriarSelectRole(client, interaction, customId, Placeholder, maxChannels) {

    const botao = new ActionRowBuilder().addComponents(
        new RoleSelectMenuBuilder()
            .setCustomId(`selectrole_${customId}`)
            .setMaxValues(maxChannels)
            .setPlaceholder(Placeholder)
    )

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltarfunctioncanais_${customId}`)
            .setLabel('Voltar')
            .setEmoji('1178068047202893869')
            .setStyle(2)
    )

    return [botao, row]
}
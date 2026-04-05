const client = require("../../index");
const Discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, StringSelectMenuBuilder } = require("discord.js");
const { Painel } = require("../../Functions/Painel");
const { Gerenciar } = require("../../Functions/Gerenciar");
const { ConfigRoles } = require("../../Functions/ConfigRoles");
const { produtos, configuracao, perms, pagamentos } = require("../../DataBaseJson");
const { GerenciarProduto } = require("../../Functions/CreateProduto");
const { QuickDB } = require("quick.db");
const { GerenciarCampos, GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { UpdateMessageProduto } = require("../../Functions/SenderMessagesOrUpdates");
const { FormasDePagamentos } = require("../../Functions/FormasDePagamentosConfig");
const { semiConfigs } = require("../../Functions/semiConfigs");
const { gerenciarPerms } = require("../../Functions/modUsersPerms");
const { Emojis } = require("../../DataBaseJson");
const db = new QuickDB();

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        // --- SISTEMA DE BOTÕES ---
        if (interaction.isButton()) {

            // Botão de Destrancar Canal
            if (interaction.customId === "unlockChannel") {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
                return interaction.update({
                    embeds: [new EmbedBuilder().setDescription(`Este canal ${interaction.channel} foi destrancado por (${interaction.user})`).setColor(`#00FF00`)],
                    components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`unlockChannel`).setLabel(`Destrancar`).setStyle(2).setDisabled(true))]
                });
            }

            // Configurações de Pagamento Semi-Automático
            if (interaction.customId == "ConfigurarPagamentoManual") {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] });
                return semiConfigs(interaction, client);
            }

            if (interaction.customId == 'editConfigSemi') {
                const dd = configuracao.get(`pagamentos.SemiAutomatico`);
                const modal = new ModalBuilder().setCustomId('ConfigurarPagamentoManual2').setTitle(`Configurar Pagamento Manual`);
                const input1 = new TextInputBuilder().setCustomId('tokenMP2').setLabel(`CHAVE PIX`).setPlaceholder(`Insira uma chave pix`).setStyle(TextInputStyle.Short).setValue(`${dd.pix || ''}`).setRequired(true);
                const input2 = new TextInputBuilder().setCustomId('tokenMP3').setLabel(`MENSAGEM PÓS-PEDIDO`).setPlaceholder(`Ex: Envie o comprovante...`).setStyle(TextInputStyle.Short).setValue(`${dd.msg || ''}`).setRequired(true);
                return await interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2)));
            }

            if (interaction.customId == 'onOffSemi') {
                const atual = configuracao.get("pagamentos.SemiAutomatico.status");
                configuracao.set("pagamentos.SemiAutomatico.status", !atual);
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] });
                return semiConfigs(interaction, client);
            }

            // Gerenciamento de Campos e Produtos
            if (interaction.customId == 'gerenciarcampossss') {
                const ggg2 = await db.get(interaction.message.id);
                const ggg = produtos.get(`${ggg2.name}.Campos`);
                if (ggg.length == 1) return GerenciarCampos2(interaction, ggg[0].Nome);

                const select = new StringSelectMenuBuilder().setCustomId('configurarcampooo').setPlaceholder('Selecione o campo');
                ggg.forEach(c => select.addOptions({ label: c.Nome, description: c.desc || 'Sem descrição', value: c.Nome, emoji: '1178163524443316285' }));
                return await interaction.update({ components: [new ActionRowBuilder().addComponents(select)], content: `Quais campos deseja gerenciar?`, embeds: [] });
            }

            if (interaction.customId == 'addcampoo') {
                const ggg2 = await db.get(interaction.message.id);
                if ((produtos.get(`${ggg2.name}.Campos`) || []).length >= 24) return interaction.reply({ ephemeral: true, content: `Limite de campos atingido.` });
                const modal = new ModalBuilder().setCustomId('sdaju112341111idsjjsdua').setTitle(`Criar campo`);
                const n1 = new TextInputBuilder().setCustomId('tokenMP').setLabel(`NOME DO CAMPO`).setStyle(1).setRequired(true);
                const n2 = new TextInputBuilder().setCustomId('tokenMP2').setLabel(`DESCRIÇÃO`).setStyle(2).setRequired(false);
                const n3 = new TextInputBuilder().setCustomId('tokenMP3').setLabel(`PREÇO`).setStyle(1).setRequired(true);
                return await interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(n1), new ActionRowBuilder().addComponents(n2), new ActionRowBuilder().addComponents(n3)));
            }

            // Sistema de Estoque e Preço (Adicionado para V270)
            if (interaction.customId.startsWith('add_stock_')) {
                const id = interaction.customId.replace('add_stock_', '');
                const modal = new ModalBuilder().setCustomId(`modal_stock_${id}`).setTitle(`Abastecer: ${id}`);
                const input = new TextInputBuilder().setCustomId('stock_data').setLabel("ITENS (UM POR LINHA)").setStyle(2).setRequired(true);
                return await interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(input)));
            }

            // Botão de Gerenciar Todos Produtos
            if (interaction.customId == "gerenciarotemae") {
                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Aguarde...`, embeds: [], components: [] });
                const ggg = produtos.fetchAll();
                const select = new StringSelectMenuBuilder().setCustomId('configproduto_1').setPlaceholder('Selecione o produto');
                ggg.slice(0, 25).forEach(p => select.addOptions({ label: p.data.Config.name || p.ID, value: p.ID, emoji: "1178163524443316285" }));
                return interaction.editReply({ content: `Qual produto deseja gerenciar?`, components: [new ActionRowBuilder().addComponents(select)] });
            }

            // Sistema de Permissões
            if (interaction.customId == 'resetPerms') {
                const modal = new ModalBuilder().setCustomId("resetmember_modal").setTitle("Resetar");
                const text = new TextInputBuilder().setCustomId("text").setLabel(`Digite "sim" para resetar`).setStyle(1).setRequired(true);
                return interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(text)));
            }

            // Navegação de Voltar
            if (interaction.customId == 'voltargerenciarproduto') {
                const ggg = await db.get(interaction.message.id);
                return GerenciarProduto(interaction, 2, ggg.name);
            }
        }

        // --- SISTEMA DE SELECT MENUS ---
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('configproduto_')) return GerenciarProduto(interaction, 2, interaction.values[0]);
            if (interaction.customId == 'configurarcampooo') return GerenciarCampos2(interaction, interaction.values[0]);
            
            if (interaction.customId == 'selectAdd&RemPerm') {
                const option = interaction.values[0];
                const modalId = option === 'addPermUser' ? "adicionarmember_modal" : "removemember_modal";
                const modal = new ModalBuilder().setCustomId(modalId).setTitle(option === 'addPermUser' ? "Adicionar" : "Remover");
                const text = new TextInputBuilder().setCustomId("text").setLabel("ID DO USUÁRIO").setStyle(1).setRequired(true);
                return interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(text)));
            }
        }

        // --- SISTEMA DE MODALS (SUBMIT) ---
        if (interaction.type === InteractionType.ModalSubmit) {

            // Cadastro de Novo Produto
            if (interaction.customId === 'sdaju11111idsjjsdua') {
                let nome = interaction.fields.getTextInputValue('tokenMP').replace('.', '');
                let desc = interaction.fields.getTextInputValue('tokenMP2') || 'Não definido';
                let entrega = interaction.fields.getTextInputValue('tokenMP3').toLowerCase() === 'não' ? 'Não' : 'Sim';
                
                if (produtos.get(nome)) return interaction.reply({ content: `Produto já existe.`, ephemeral: true });
                produtos.set(nome, { Config: { name: nome, desc, entrega }, Campos: [], Cupom: [] });
                return GerenciarProduto(interaction, 1, nome);
            }

            // Edição de Produto Existente
            if (interaction.customId === 'Editar') {
                const ggg = await db.get(interaction.message.id);
                const nome = interaction.fields.getTextInputValue('tokenMP');
                const desc = interaction.fields.getTextInputValue('tokenMP2');
                produtos.set(`${ggg.name}.Config.name`, nome);
                produtos.set(`${ggg.name}.Config.desc`, desc || "Não definido");
                return GerenciarProduto(interaction, 1, ggg.name);
            }

            // Adicionar Estoque (V270)
            if (interaction.customId.startsWith('modal_stock_')) {
                const id = interaction.customId.replace('modal_stock_', '');
                const conteudo = interaction.fields.getTextInputValue('stock_data').split('\n').filter(l => l.trim() !== "");
                const atual = produtos.get(`${id}.estoque`) || [];
                produtos.set(`${id}.estoque`, [...atual, ...conteudo]);
                await interaction.reply({ content: `Estoque abastecido!`, ephemeral: true });
                return await UpdateMessageProduto(client, id);
            }

            // Permissões: Adicionar Membro
            if (interaction.customId === "adicionarmember_modal") {
                const userID = interaction.fields.getTextInputValue("text");
                if (perms.has(userID)) return interaction.reply({ content: `Usuário já tem permissão.`, ephemeral: true });
                perms.set(userID, userID);
                await interaction.update({ content: `Carregando...`, components: [] });
                return gerenciarPerms(interaction, client);
            }

            // Configuração Pagamento Manual
            if (interaction.customId === 'ConfigurarPagamentoManual2') {
                const pix = interaction.fields.getTextInputValue('tokenMP2');
                const msg = interaction.fields.getTextInputValue('tokenMP3');
                configuracao.set(`pagamentos.SemiAutomatico.pix`, pix);
                configuracao.set(`pagamentos.SemiAutomatico.msg`, msg);
                await interaction.update({ content: `Salvo!`, components: [] });
                return semiConfigs(interaction, client);
            }
        }
    }
};

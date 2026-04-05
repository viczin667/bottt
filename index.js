const client = require("../../index");
const Discord = require("discord.js");
const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, 
    TextInputBuilder, TextInputStyle, InteractionType, StringSelectMenuBuilder 
} = require("discord.js");

// Importações Alinhadas com seu Index e DataBase
const { produtos, configuracao, perms, Emojis } = require("../../DataBaseJson");
const { GerenciarProduto } = require("../../Functions/CreateProduto");
const { GerenciarCampos, GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { UpdateMessageProduto } = require("../../Functions/SenderMessagesOrUpdates");
const { semiConfigs } = require("../../Functions/semiConfigs");
const { gerenciarPerms } = require("../../Functions/modUsersPerms");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        
        // --- SISTEMA DE SEGURANÇA XENZA (PROTOCOLO ADMIN) ---
        // Verifica se o usuário tem permissão na DB ou é Admin do Servidor
        const isAdmin = perms.get(interaction.user.id) || interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator);

        // --- 1. GESTÃO DE BOTÕES ---
        if (interaction.isButton()) {
            const { customId } = interaction;

            // Bloqueio de Segurança para funções críticas
            const restricted = ["gerenciarotemae", "ConfigurarPagamentoManual", "onOffSemi", "addcampoo"];
            if (restricted.includes(customId) && !isAdmin) {
                return interaction.reply({ content: `❌ Acesso negado. Apenas administradores da Xenza podem alterar configurações.`, ephemeral: true });
            }

            // Funções de Utilidade Pública (Unlock Channel)
            if (customId === "unlockChannel") {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
                return interaction.update({
                    embeds: [new EmbedBuilder().setDescription(`🔓 Canal destrancado por ${interaction.user}`).setColor("#00FF00")],
                    components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('un').setLabel('Liberado').setStyle(2).setDisabled(true))]
                });
            }

            // Navegação do Painel Administrativo
            switch (customId) {
                case "gerenciarotemae":
                    await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando Catálogo...`, embeds: [], components: [] });
                    const allProds = produtos.fetchAll();
                    const menu = new StringSelectMenuBuilder().setCustomId('configproduto_1').setPlaceholder('Selecione um produto para editar');
                    allProds.slice(0, 25).forEach(p => menu.addOptions({ label: p.ID, value: p.ID, emoji: "1178163524443316285" }));
                    return interaction.editReply({ content: '⚙️ **Painel Xenza V270 - Gerenciamento de Produtos**', components: [new ActionRowBuilder().addComponents(menu)] });

                case "ConfigurarPagamentoManual":
                    return semiConfigs(interaction, client);

                case "onOffSemi":
                    const status = configuracao.get("pagamentos.SemiAutomatico.status");
                    configuracao.set("pagamentos.SemiAutomatico.status", !status);
                    return semiConfigs(interaction, client);

                case "gerenciarcampossss":
                    const msgData = await db.get(interaction.message.id);
                    const campos = produtos.get(`${msgData.name}.Campos`) || [];
                    if (campos.length === 0) return interaction.reply({ content: "Este produto não possui campos.", ephemeral: true });
                    const selCampos = new StringSelectMenuBuilder().setCustomId('configurarcampooo').setPlaceholder('Selecione o campo');
                    campos.forEach(c => selCampos.addOptions({ label: c.Nome, value: c.Nome }));
                    return interaction.update({ components: [new ActionRowBuilder().addComponents(selCampos)], content: `Editando campos de: **${msgData.name}**`, embeds: [] });

                case "voltargerenciarproduto":
                    const backData = await db.get(interaction.message.id);
                    return GerenciarProduto(interaction, 2, backData.name);
            }

            // Funções Dinâmicas (Estoque e Preço)
            if (customId.startsWith('add_stock_')) {
                const id = customId.replace('add_stock_', '');
                const modal = new ModalBuilder().setCustomId(`modal_stock_${id}`).setTitle(`Abastecer Estoque: ${id}`);
                const input = new TextInputBuilder().setCustomId('data').setLabel("ITENS (UM POR LINHA)").setStyle(TextInputStyle.Paragraph).setRequired(true);
                return interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(input)));
            }
        }

        // --- 2. GESTÃO DE MENUS DE SELEÇÃO ---
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('configproduto_')) return GerenciarProduto(interaction, 2, interaction.values[0]);
            if (interaction.customId === 'configurarcampooo') return GerenciarCampos2(interaction, interaction.values[0]);
            
            if (interaction.customId === 'selectAdd&RemPerm') {
                const isAdd = interaction.values[0] === 'addPermUser';
                const modal = new ModalBuilder().setCustomId(isAdd ? "adicionarmember_modal" : "removemember_modal").setTitle(isAdd ? "Adicionar Permissão" : "Remover Permissão");
                const input = new TextInputBuilder().setCustomId("text").setLabel("ID DO USUÁRIO").setStyle(TextInputStyle.Short).setRequired(true);
                return interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(input)));
            }
        }

        // --- 3. GESTÃO DE MODALS (SUBMIT) ---
        if (interaction.type === InteractionType.ModalSubmit) {
            const { customId, fields } = interaction;

            // Salvamento de Estoque
            if (customId.startsWith('modal_stock_')) {
                const id = customId.replace('modal_stock_', '');
                const rawItens = fields.getTextInputValue('data').split('\n').filter(i => i.trim() !== "");
                const oldEstoque = produtos.get(`${id}.estoque`) || [];
                produtos.set(`${id}.estoque`, [...oldEstoque, ...rawItens]);
                
                await interaction.reply({ content: `✅ **${rawItens.length}** itens adicionados ao estoque de **${id}**.`, ephemeral: true });
                return UpdateMessageProduto(client, id);
            }

            // Configuração de Pagamento Manual (PIX)
            if (customId === 'ConfigurarPagamentoManual2') {
                configuracao.set(`pagamentos.SemiAutomatico.pix`, fields.getTextInputValue('tokenMP2'));
                configuracao.set(`pagamentos.SemiAutomatico.msg`, fields.getTextInputValue('tokenMP3'));
                await interaction.reply({ content: `✅ Configurações de PIX atualizadas!`, ephemeral: true });
                return semiConfigs(interaction, client);
            }

            // Gerenciamento de Membros Admin
            if (customId === "adicionarmember_modal") {
                const userId = fields.getTextInputValue("text");
                perms.set(userId, userId);
                await interaction.reply({ content: `✅ Usuário \`${userId}\` agora é um administrador Xenza.`, ephemeral: true });
                return gerenciarPerms(interaction, client);
            }

            // Cadastro de Novos Produtos
            if (customId === 'sdaju11111idsjjsdua') {
                const nomeProd = fields.getTextInputValue('tokenMP').replace(/\s/g, '_');
                if (produtos.has(nomeProd)) return interaction.reply({ content: "Este produto já existe!", ephemeral: true });
                
                produtos.set(nomeProd, { 
                    Config: { name: nomeProd, desc: fields.getTextInputValue('tokenMP2') || "Sem descrição", entrega: "Sim" },
                    Campos: [], Cupom: [], estoque: [] 
                });
                return GerenciarProduto(interaction, 1, nomeProd);
            }
        }
    }
};

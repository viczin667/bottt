const client = require("../../index");
const Discord = require("discord.js");
const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, 
    TextInputBuilder, TextInputStyle, InteractionType, StringSelectMenuBuilder 
} = require("discord.js");

// Bancos de Dados e Funções Core
const { produtos, configuracao, perms, cupom, vendas, Emojis } = require("../../DataBaseJson");
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

        // --- SISTEMA DE SEGURANÇA: XENZA ADMIN ONLY ---
        // Apenas administradores definidos na perms ou donos do server podem alterar configs
        const isAdmin = perms.get(interaction.user.id) || interaction.member.permissions.has("Administrator");

        // --- BLOCO 1: TRATAMENTO DE BOTÕES (O CORAÇÃO DO SCRIPT) ---
        if (interaction.isButton()) {
            
            // Segurança: Se for botão de config e não for admin, bloqueia
            const adminButtons = ["gerenciarotemae", "ConfigurarPagamentoManual", "onOffSemi", "addcampoo", "resetPerms"];
            if (adminButtons.includes(interaction.customId) && !isAdmin) {
                return interaction.reply({ content: `❌ Apenas administradores da Xenza podem fazer isso.`, ephemeral: true });
            }

            switch (interaction.customId) {
                case "unlockChannel":
                    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
                    return interaction.update({
                        embeds: [new EmbedBuilder().setDescription(`🔓 Canal liberado por ${interaction.user}`).setColor("#00FF00")],
                        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('un').setLabel('Destrancado').setStyle(2).setDisabled(true))]
                    });

                case "gerenciarotemae":
                    await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Buscando produtos...`, embeds: [], components: [] });
                    const allProds = produtos.fetchAll();
                    const menuProds = new StringSelectMenuBuilder().setCustomId('configproduto_1').setPlaceholder('Selecione o produto');
                    allProds.slice(0, 25).forEach(p => menuProds.addOptions({ label: p.ID, value: p.ID, emoji: "1178163524443316285" }));
                    return interaction.editReply({ content: 'Painel de Gerenciamento Xenza V270:', components: [new ActionRowBuilder().addComponents(menuProds)] });

                case "ConfigurarPagamentoManual":
                    return semiConfigs(interaction, client);

                case "onOffSemi":
                    const s = configuracao.get("pagamentos.SemiAutomatico.status");
                    configuracao.set("pagamentos.SemiAutomatico.status", !s);
                    return semiConfigs(interaction, client);

                case "editConfigSemi":
                    const dataSemi = configuracao.get(`pagamentos.SemiAutomatico`);
                    const mSemi = new ModalBuilder().setCustomId('ConfigurarPagamentoManual2').setTitle(`Configurar PIX Manual`);
                    const i1 = new TextInputBuilder().setCustomId('tokenMP2').setLabel(`CHAVE PIX`).setValue(dataSemi.pix || "").setStyle(1).setRequired(true);
                    const i2 = new TextInputBuilder().setCustomId('tokenMP3').setLabel(`MENSAGEM PÓS-PAGAMENTO`).setValue(dataSemi.msg || "").setStyle(2).setRequired(true);
                    return interaction.showModal(mSemi.addComponents(new ActionRowBuilder().addComponents(i1), new ActionRowBuilder().addComponents(i2)));

                case "gerenciarcampossss":
                    const info = await db.get(interaction.message.id);
                    const listCampos = produtos.get(`${info.name}.Campos`) || [];
                    if (listCampos.length === 0) return interaction.reply({ content: "Crie um campo primeiro.", ephemeral: true });
                    const menuCampos = new StringSelectMenuBuilder().setCustomId('configurarcampooo').setPlaceholder('Escolha o campo');
                    listCampos.forEach(c => menuCampos.addOptions({ label: c.Nome, value: c.Nome }));
                    return interaction.update({ components: [new ActionRowBuilder().addComponents(menuCampos)], content: 'Configurar campo de: ' + info.name, embeds: [] });

                case "addcampoo":
                    const modalCampo = new ModalBuilder().setCustomId('modal_criar_campo').setTitle(`Novo Campo`);
                    const c1 = new TextInputBuilder().setCustomId('nome').setLabel(`NOME`).setStyle(1).setRequired(true);
                    const c2 = new TextInputBuilder().setCustomId('desc').setLabel(`DESCRIÇÃO`).setStyle(2).setRequired(false);
                    const c3 = new TextInputBuilder().setCustomId('preco').setLabel(`VALOR`).setStyle(1).setRequired(true);
                    return interaction.showModal(modalCampo.addComponents(new ActionRowBuilder().addComponents(c1), new ActionRowBuilder().addComponents(c2), new ActionRowBuilder().addComponents(c3)));

                case "voltargerenciarproduto":
                    const dbData = await db.get(interaction.message.id);
                    return GerenciarProduto(interaction, 2, dbData.name);
            }

            // --- LÓGICA DE BOTÕES DINÂMICOS (V270) ---
            if (interaction.customId.startsWith('add_stock_')) {
                const id = interaction.customId.replace('add_stock_', '');
                const m = new ModalBuilder().setCustomId(`modal_stock_${id}`).setTitle(`Abastecer: ${id}`);
                const input = new TextInputBuilder().setCustomId('data').setLabel("ITENS").setStyle(2).setRequired(true);
                return interaction.showModal(m.addComponents(new ActionRowBuilder().addComponents(input)));
            }
        }

        // --- BLOCO 2: MENUS DE SELEÇÃO (SELECT MENUS) ---
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('configproduto_')) return GerenciarProduto(interaction, 2, interaction.values[0]);
            if (interaction.customId === 'configurarcampooo') return GerenciarCampos2(interaction, interaction.values[0]);
            
            if (interaction.customId === 'selectAdd&RemPerm') {
                const isAdd = interaction.values[0] === 'addPermUser';
                const m = new ModalBuilder().setCustomId(isAdd ? "adicionarmember_modal" : "removemember_modal").setTitle("Gerenciar Permissão");
                const t = new TextInputBuilder().setCustomId("text").setLabel("ID DO USUÁRIO").setStyle(1).setRequired(true);
                return interaction.showModal(m.addComponents(new ActionRowBuilder().addComponents(t)));
            }
        }

        // --- BLOCO 3: SUBMISSÃO DE MODALS (ONDE TUDO É SALVO) ---
        if (interaction.type === InteractionType.ModalSubmit) {
            
            // Cadastro de Itens no Estoque
            if (interaction.customId.startsWith('modal_stock_')) {
                const id = interaction.customId.replace('modal_stock_', '');
                const novosItens = interaction.fields.getTextInputValue('data').split('\n').filter(x => x.trim() !== "");
                const estoqueVelho = produtos.get(`${id}.estoque`) || [];
                produtos.set(`${id}.estoque`, [...estoqueVelho, ...novosItens]);
                await interaction.reply({ content: `✅ Adicionados com sucesso!`, ephemeral: true });
                return UpdateMessageProduto(client, id);
            }

            // Criar Novo Campo de Produto
            if (interaction.customId === 'modal_criar_campo') {
                const info = await db.get(interaction.message.id);
                const nomeC = interaction.fields.getTextInputValue('nome');
                const descC = interaction.fields.getTextInputValue('desc') || "Sem descrição";
                const valorC = interaction.fields.getTextInputValue('preco').replace(',', '.');
                
                produtos.push(`${info.name}.Campos`, { Nome: nomeC, Preco: Number(valorC), desc: descC });
                await interaction.reply({ content: "Campo criado!", ephemeral: true });
                return GerenciarCampos(interaction, info.name);
            }

            // Configuração do PIX
            if (interaction.customId === 'ConfigurarPagamentoManual2') {
                configuracao.set(`pagamentos.SemiAutomatico.pix`, interaction.fields.getTextInputValue('tokenMP2'));
                configuracao.set(`pagamentos.SemiAutomatico.msg`, interaction.fields.getTextInputValue('tokenMP3'));
                await interaction.reply({ content: "Configurações salvas!", ephemeral: true });
                return semiConfigs(interaction, client);
            }

            // Permissões Admin
            if (interaction.customId === "adicionarmember_modal") {
                const idU = interaction.fields.getTextInputValue("text");
                perms.set(idU, idU);
                await interaction.reply({ content: "Novo administrador adicionado!", ephemeral: true });
                return gerenciarPerms(interaction, client);
            }
        }
    }
};

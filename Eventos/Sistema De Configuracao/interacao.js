const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, StringSelectMenuBuilder } = require("discord.js");
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
        const { customId, type, fields, user } = interaction;
        const isAdmin = perms.get(user.id) || interaction.member.permissions.has("Administrator");

        // --- [1] AUTOCOMPLETE (BUSCA DE PRODUTOS) ---
        if (interaction.isAutocomplete()) {
            const input = interaction.options.getFocused().toLowerCase();
            const list = produtos.filter(x => x.ID.toLowerCase().includes(input)).slice(0, 25);
            return interaction.respond(list.map(x => ({ name: `📦 ${x.data?.Config?.name || x.ID}`, value: x.ID })));
        }

        // --- [2] TRATAMENTO DE BOTÕES ---
        if (interaction.isButton()) {
            // Bloqueio de Segurança
            const adminOnly = ["gerenciarotemae", "ConfigurarPagamentoManual", "onOffSemi", "addcampoo", "edit_estetica_"];
            if (adminOnly.some(id => customId.startsWith(id)) && !isAdmin) {
                return interaction.reply({ content: `❌ Acesso negado à Xenza V270.`, ephemeral: true });
            }

            // Lógica de Estética (V270)
            if (customId.startsWith('edit_estetica_')) {
                const id = customId.split('_')[2];
                const data = produtos.get(id).data?.Config || {};
                const modal = new ModalBuilder().setCustomId(`modal_estetica_${id}`).setTitle(`Estética: ${id}`);
                
                const rows = [
                    { id: 'nome_p', label: "NOME EXIBIDO", val: data.name },
                    { id: 'cor_p', label: "COR HEX", val: data.cor, ph: "#5865F2" },
                    { id: 'link_p', label: "LINK DA LOJA", val: data.link_site },
                    { id: 'banner_p', label: "URL DO BANNER", val: data.banner }
                ].map(c => new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId(c.id).setLabel(c.label).setValue(c.val || "").setPlaceholder(c.ph || "").setStyle(1)
                ));
                return interaction.showModal(modal.addComponents(rows));
            }

            switch (customId) {
                case "gerenciarotemae":
                    const menu = new StringSelectMenuBuilder().setCustomId('configproduto_1').setPlaceholder('Selecione o produto');
                    produtos.fetchAll().slice(0, 25).forEach(p => menu.addOptions({ label: p.ID, value: p.ID, emoji: "📦" }));
                    return interaction.reply({ content: 'Painel Xenza:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
                
                case "onOffSemi":
                    configuracao.set("pagamentos.SemiAutomatico.status", !configuracao.get("pagamentos.SemiAutomatico.status"));
                    return semiConfigs(interaction, client);
                
                case "unlockChannel":
                    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
                    return interaction.reply({ content: "🔓 Canal liberado." });
            }
        }

        // --- [3] SUBMISSÃO DE MODALS (SALVAMENTO) ---
        if (type === InteractionType.ModalSubmit) {
            // Salvar Estética
            if (customId.startsWith('modal_estetica_')) {
                const id = customId.split('_')[2];
                const [nome, cor, link, banner] = ['nome_p', 'cor_p', 'link_p', 'banner_p'].map(f => fields.getTextInputValue(f));
                
                if (cor && !/^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(cor)) return interaction.reply({ content: "❌ Cor Inválida!", ephemeral: true });

                const p = `${id}.data.Config`;
                if (nome) produtos.set(`${p}.name`, nome);
                if (cor) produtos.set(`${p}.cor`, cor.startsWith('#') ? cor : `#${cor}`);
                if (link) produtos.set(`${p}.link_site`, link);
                if (banner) produtos.set(`${p}.banner`, banner);

                await interaction.reply({ content: `✅ Dados de **${id}** atualizados!`, ephemeral: true });
                return UpdateMessageProduto(client, id);
            }

            // Abastecer Estoque
            if (customId.startsWith('modal_stock_')) {
                const id = customId.replace('modal_stock_', '');
                const itens = fields.getTextInputValue('data').split('\n').filter(x => x.trim());
                produtos.push(`${id}.estoque`, ...itens);
                await interaction.reply({ content: `✅ Itens adicionados!`, ephemeral: true });
                return UpdateMessageProduto(client, id);
            }
        }

        // --- [4] MENUS DE SELEÇÃO ---
        if (interaction.isStringSelectMenu()) {
            if (customId.startsWith('configproduto_')) return GerenciarProduto(interaction, 2, interaction.values[0]);
        }
    }
};

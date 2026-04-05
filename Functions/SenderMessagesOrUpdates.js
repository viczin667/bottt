const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");

// 🛠️ FUNÇÃO INTERNA: Construtor de Embed e Botões (O "Cérebro" da Vitrine)
async function buildProductMessage(productID, configVenda = {}) {
    const yyy = produtos.get(productID);
    if (!yyy) return null;

    // --- EMBED ---
    const embed = new EmbedBuilder()
        .setColor(yyy.Config.cor || configVenda.colorembed || "#2f3136")
        .setTimestamp();

    if (yyy.Config.desc !== "Não definido") embed.setDescription(yyy.Config.desc);

    const titleText = `${yyy.Config.name}${yyy.Config.entrega === 'Sim' ? '\n⭐ Entrega Automática ⭐' : ''}`;
    embed.setAuthor({ name: titleText, iconURL: yyy.Config.icon || yyy.Config.thumbnail || null });

    if (yyy.Config.banner || yyy.Config.imagem) embed.setImage(yyy.Config.banner || yyy.Config.imagem);

    const rows = [];

    // --- LÓGICA DE COMPRA (MULTICAMPOS VS ÚNICO) ---
    if (!configVenda.textobutton && yyy.Campos.length > 1) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('comprarid')
            .setPlaceholder('Escolha uma das opções abaixo:');

        yyy.Campos.forEach(element => {
            selectMenu.addOptions({
                label: element.Nome,
                description: `R$ ${Number(element.valor).toLocaleString('pt-BR')} | Estoque: ${element.estoque.length}`,
                value: `${element.Nome}_${productID}`
            });
        });
        rows.push(new ActionRowBuilder().addComponents(selectMenu));
    } else {
        const campo = yyy.Campos[0];
        if (campo) {
            if (campo.desc) embed.addFields({ name: campo.Nome, value: campo.desc.slice(0, 1024) });
            
            embed.addFields(
                { name: `💰 Preço`, value: `\`R$ ${Number(campo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\``, inline: true },
                { name: `📦 Estoque`, value: `\`${campo.estoque.length}\``, inline: true }
            );

            const rowBtn = new ActionRowBuilder();

            // 🚀 SISTEMA DE LINK FEIRAFY (V270)
            if (yyy.Config.link_site && yyy.Config.link_site.startsWith('http')) {
                rowBtn.addComponents(
                    new ButtonBuilder()
                        .setLabel(configVenda.textobutton || 'Comprar no Site')
                        .setEmoji('🛒')
                        .setStyle(5) // Link
                        .setURL(yyy.Config.link_site)
                );
            } else {
                rowBtn.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`comprarid_${campo.Nome}_${productID}`)
                        .setLabel(configVenda.textobutton || 'Adquirir')
                        .setEmoji(configVenda.emoji || '💳')
                        .setStyle(3) // Verde (Sucesso)
                );
            }
            rows.push(rowBtn);
        }
    }

    // Botão de Dúvidas (Se ativo nas configs gerais)
    if (configuracao.get(`BotaoDuvidas.status`)) {
        const btnDuvida = new ButtonBuilder()
            .setURL(configuracao.get(`BotaoDuvidas.linkbotao`))
            .setLabel(configuracao.get(`BotaoDuvidas.nomebotao`))
            .setStyle(5);
        if (configuracao.get(`BotaoDuvidas.emoji`)) btnDuvida.setEmoji(configuracao.get(`BotaoDuvidas.emoji`));

        if (rows.length > 0 && rows[rows.length-1].components.length < 5) {
            rows[rows.length-1].addComponents(btnDuvida);
        } else {
            rows.push(new ActionRowBuilder().addComponents(btnDuvida));
        }
    }

    return { embeds: [embed], components: rows };
}

async function MessageCreate(interaction, client) {
    const fdfd = await db.get(`${interaction.user.id}_colocarvenda`);
    const channel = await client.channels.fetch(interaction.values[0]).catch(() => null);
    if (!channel) return interaction.reply({ content: "❌ Canal não encontrado.", ephemeral: true });

    const messageData = await buildProductMessage(fdfd.produto, fdfd);
    
    await interaction.update({ content: `⌛ Postando vitrine Xenza...`, embeds: [], components: [] });
    const msgPostada = await channel.send(messageData);

    let mensagens = produtos.get(`${fdfd.produto}.mensagens`) || [];
    mensagens.push({ guildid: msgPostada.guild.id, channelid: msgPostada.channel.id, mesageid: msgPostada.id, configvenda: fdfd });
    produtos.set(`${fdfd.produto}.mensagens`, mensagens);

    await interaction.editReply({ content: `✅ Sucesso! Produto postado em ${channel}.`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setURL(msgPostada.url).setLabel('Ir para Mensagem').setStyle(5))] });
}

async function UpdateMessageProduto(client, produtoID) {
    const data = produtos.get(produtoID);
    if (!data || !data.mensagens) return;

    for (const element of data.mensagens) {
        try {
            const channel = await client.channels.fetch(element.channelid);
            const msg = await channel.messages.fetch(element.mesageid);
            const newMessageData = await buildProductMessage(produtoID, element.configvenda || {});
            if (newMessageData) await msg.edit(newMessageData);
        } catch (e) {
            // Limpa registro se a mensagem/canal sumiu
            const nData = produtos.get(`${produtoID}.mensagens`).filter(m => m.mesageid !== element.mesageid);
            produtos.set(`${produtoID}.mensagens`, nData);
        }
    }
}

module.exports = {
    MessageCreate,
    UpdateMessageProduto,
    UpdateAllMessagesProduct: async (client) => {
        const all = produtos.all();
        for (const p of all) await UpdateMessageProduto(client, p.ID);
    }
};
